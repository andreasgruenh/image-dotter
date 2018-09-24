import sizeOf from 'buffer-image-size';
import { remote } from 'electron';
import produce from 'immer';
import { basename, join, parse } from 'path';
import { ReplaySubject } from 'rxjs';

const fs = remote.require('fs-extra');

class File {
  constructor(absolutePath) {
    this.absolutePath = absolutePath;
    this.fileName = basename(absolutePath);
    this.parsedPath = parse(absolutePath);
  }

  getAnnotationPath = () => {
    const p = this.parsedPath;
    const absolutePath = join(p.dir, p.name + '.annotations.txt');
    return absolutePath;
  };

  stateInitialized = false;
  state$ = new ReplaySubject(1);

  getState = () => {
    if (!this.stateInitialized) {
      this.readAnnotationFile();
      this.stateInitialized = true;
    }
    return this.state$;
  };

  readAnnotationFile = async () => {
    try {
      const content = (await fs.readFile(this.getAnnotationPath())).toString('utf-8');
      this.currentState = {
        annotations: content
          .split('\n')
          .filter(line => line.length > 0)
          .map(line => line.split(' ').map(x => parseInt(x)))
      };
    } catch (err) {
      this.currentState = {
        annotations: []
      };
    }
    this.state$.next(this.currentState);
  };

  imageData = null;
  getImageData = () => {
    if (!this.imageData) {
      this.imageData = new Promise(async resolve => {
        const buffer = await fs.readFile(this.absolutePath);
        resolve({
          buffer,
          dimensions: sizeOf(buffer)
        });
      });
    }
    return this.imageData;
  };

  addAnnotation = (x, y) => {
    this.currentState = produce(this.currentState, state => {
      state.annotations.push([x, y]);
    });
    this.state$.next(this.currentState);
    this.saveState();
  };

  updateAnnotation = (index, x, y) => {
    this.currentState = produce(this.currentState, state => {
      state.annotations[index] = [x, y];
    });
    this.state$.next(this.currentState);
    this.saveState();
  };

  deleteAnnotation = index => {
    this.currentState = produce(this.currentState, state => {
      state.annotations.splice(index, 1);
    });
    this.state$.next(this.currentState);
    this.saveState();
  };

  saveState = async () => {
    const string = this.currentState.annotations.map(row => row.join(' ')).join('\n');
    await fs.writeFile(this.getAnnotationPath(), string);
  };
}

export default File;

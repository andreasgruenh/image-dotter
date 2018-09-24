import { remote } from 'electron';
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
  state$ = new ReplaySubject();

  getState = () => {
    if (!this.stateInitialized) {
      this.readAnnotationFile();
      this.stateInitialized = true;
    }
    return this.state$;
  };

  readAnnotationFile = async () => {
    try {
      const content = await fs.readFile(this.getAnnotationPath());
      this.state$.next({ annotations: content.split('\n') });
    } catch (err) {
      this.state$.next({ annotations: 0 });
    }
  };
}

export default File;

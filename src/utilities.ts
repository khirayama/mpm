// Doc: https://github.com/yarnpkg/lets-dev-demo/blob/master/utilities.js
// tslint:disable:no-any
import * as gunzipMaybe from 'gunzip-maybe';
import * as Progress from 'progress';
import * as tarFs from 'tar-fs';
import * as tarStream from 'tar-stream';

function getFileName(entryName: string, virtualPath: number): string | null {
  let normalizeEntryName: string = entryName.replace(/^\/+/, '');

  for (let t: number = 0; t < virtualPath; t += 1) {
    const index: number = normalizeEntryName.indexOf('/');

    if (index === -1) {
      return null;
    }

    normalizeEntryName = normalizeEntryName.substr(index + 1);
  }

  return normalizeEntryName;
}

export async function readFileFromArchive(fileName: string, buffer: Buffer, virtualPath: number): Promise<{}> {
  return new Promise(
    (resolve: any, reject: any): void => {
      const extractor: tarStream.Extract = tarStream.extract();

      extractor.on('entry', (headers: tarStream.Headers, stream: tarStream.Pack, next: any) => {
        if (getFileName(headers.name, virtualPath) === fileName) {
          const buffers: Buffer[] = [];

          stream.on(
            'data',
            (data: Buffer): void => {
              buffers.push(data);
            },
          );

          stream.on(
            'error',
            (err: Error): void => {
              reject(err);
            },
          );

          stream.on('end', () => {
            resolve(Buffer.concat(buffers));
          });
        } else {
          stream.on('end', () => {
            next();
          });
        }

        stream.resume();
      });

      extractor.on('error', (err: Error) => {
        reject(err);
      });

      extractor.on('finish', () => {
        reject(new Error(`Couldn't find "${fileName}" inside the archive`));
      });

      const gunzipper: any = gunzipMaybe();
      gunzipper.pipe(extractor);

      gunzipper.on(
        'error',
        (err: Error): void => {
          reject(err);
        },
      );

      gunzipper.write(buffer);
      gunzipper.end();
    },
  );
}

export async function readPackageJsonFromArchive(packageBuffer: Buffer): Promise<any> {
  const virtualPath: number = 1;

  return readFileFromArchive('package.json', packageBuffer, virtualPath);
}

export async function extractArchiveTo(packageBuffer: Buffer, target: string, virtualPath: number): Promise<any> {
  return new Promise(
    (resolve: any, reject: any): void => {
      function map(header: any): any {
        header.name = getFileName(header.name, virtualPath) || header.name;

        return header;
      }

      const gunzipper: any = gunzipMaybe();

      const extractor: any = tarFs.extract(target, { map });
      gunzipper.pipe(extractor);

      extractor.on(
        'error',
        (err: Error): void => {
          reject(err);
        },
      );

      extractor.on('finish', () => {
        resolve();
      });

      gunzipper.write(packageBuffer);
      gunzipper.end();
    },
  );
}

export async function extractNpmArchiveTo(packageBuffer: Buffer, target: string): Promise<any> {
  const virtualPath: number = 1;

  return extractArchiveTo(packageBuffer, target, virtualPath);
}

export async function trackProgress(cb: any): Promise<Progress> {
  const pace: Progress = new Progress(':bar :current/:total (:elapseds)', { width: 80, total: 1 });

  try {
    return await cb(pace);
  } finally {
    if (!pace.complete) {
      pace.update(1);
      pace.terminate();
    }
  }
}

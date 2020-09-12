import index from '@/public/index.json';

import type { FSModule } from 'browserfs/dist/node/core/FS';
import type { FC } from 'react';

import { createContext, useEffect, useState } from 'react';

type ListingObj = {
  [key: string]: ListingObj | string | null;
};

const writableJsonFs = (
  path: string,
  listingUrlOrObj: string | ListingObj
): { [key: string]: BrowserFS.FileSystemConfiguration } => ({
  [path]: {
    fs: 'OverlayFS',
    options: {
      readable: {
        fs: 'XmlHttpRequest',
        options: {
          index: listingUrlOrObj
        }
      },
      writable: {
        fs: 'IndexedDB',
        options: {
          storeName: `browser-fs-cache (${path})`
        }
      }
    }
  }
});

export const FilesContext = createContext<FSModule>({} as FSModule);

export const FilesProvider: FC = ({ children }) => {
  const [fs, setFs] = useState<FSModule>({} as FSModule);

  useEffect(() => {
    import('browserfs').then((BrowserFS) => {
      BrowserFS.install(window);

      BrowserFS.configure(
        {
          fs: 'MountableFileSystem',
          options: writableJsonFs('/', index)
        },
        () => {
          setFs(BrowserFS.BFSRequire('fs'));
        }
      );
    });
  }, []);

  return <FilesContext.Provider value={fs}>{children}</FilesContext.Provider>;
};

export default FilesProvider;
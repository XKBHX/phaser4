import { FileState } from './FileState';
import { IFile } from './IFile';
import { XHRLoader } from './XHRLoader';
import { XHRSettings } from './XHRSettings';

export function File (key: string, url: string, type: string): IFile
{
    return {

        key,
        url,
        type,

        xhrLoader: undefined,
        xhrSettings: XHRSettings(),

        data: null,
        state: FileState.PENDING,

        bytesLoaded: 0,
        bytesTotal: 0,
        percentComplete: 0,

        load (): Promise<any>
        {
            console.log('File.load', this.key);

            this.state = FileState.PENDING;

            XHRLoader(this);

            return new Promise(
                (resolve, reject) => {
                    this.loaderResolve = resolve;
                    this.loaderReject = reject;
                }
            );
        },

        onLoadStart (event: ProgressEvent)
        {
            console.log('onLoadStart');

            this.state = FileState.LOADING;
        },

        onLoad (event: ProgressEvent)
        {
            console.log('onLoad');

            const xhr = this.xhrLoader;

            const localFileOk = ((xhr.responseURL && xhr.responseURL.indexOf('file://') === 0 && xhr.status === 0));

            let success = !(event.target && xhr.status !== 200) || localFileOk;

            //  Handle HTTP status codes of 4xx and 5xx as errors, even if xhr.onerror was not called.
            if (xhr.readyState === 4 && xhr.status >= 400 && xhr.status <= 599)
            {
                success = false;
            }

            this.onProcess()
                .then(() => this.onComplete())
                .catch(() => this.onError());
        },

        onLoadEnd (event: ProgressEvent)
        {
            console.log('onLoadEnd');

            this.resetXHR();

            this.state = FileState.LOADED;
        },

        onTimeout (event: ProgressEvent)
        {
            console.log('onTimeout');

            this.state = FileState.TIMED_OUT;
        },

        onAbort (event: ProgressEvent)
        {
            console.log('onAbort');

            this.state = FileState.ABORTED;
        },

        onError (event: ProgressEvent)
        {
            console.log('onError');

            this.state = FileState.ERRORED;

            if (this.fileReject)
            {
                this.fileReject(this);
            }
        },

        onProgress (event: ProgressEvent)
        {
            console.log('onProgress');

            if (event.lengthComputable)
            {
                this.bytesLoaded = event.loaded;
                this.bytesTotal = event.total;
                this.percentComplete = Math.min((event.loaded / event.total), 1);

                console.log(this.percentComplete, '%');
            }
        },

        onProcess (): Promise<any>
        {
            console.log('File.onProcess');

            this.state = FileState.PROCESSING;

            return new Promise(
                (resolve, reject) => {
                    resolve();
                }
            );
        },

        onComplete ()
        {
            console.log('onComplete!');
            
            this.state = FileState.COMPLETE;

            if (this.fileResolve)
            {
                this.fileResolve(this);
            }
            else if (this.loaderResolve)
            {
                this.loaderResolve(this);
            }
        },

        onDestroy ()
        {
            this.state = FileState.DESTROYED;
        }

    };
}

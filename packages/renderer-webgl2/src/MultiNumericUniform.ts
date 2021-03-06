import { GetUniform } from './GetUniform';

export class MultiNumericUniform
{
    gl: WebGL2RenderingContext;
    handle: WebGLUniformLocation;
    glFunc;
    count: number;
    cache: (Float32Array | Int32Array | Uint32Array);

    constructor (gl: WebGL2RenderingContext, handle: WebGLUniformLocation, info: WebGLActiveInfo, count: number)
    {
        this.gl = gl;

        this.handle = handle;

        this.count = count;

        const uniformData = GetUniform(gl, info.type);

        this.glFunc = uniformData.glFunc;

        this.cache = uniformData.cacheClass(uniformData.size * count);
    }

    set (value: Int32Array | Uint32Array | Float32Array)
    {
        for (let i = 0; i < value.length; i++)
        {
            if (this.cache[i] !== value[i])
            {
                this.glFunc(this.handle, value);

                this.cache.set(value);

                return;
            }
        }
    }
}

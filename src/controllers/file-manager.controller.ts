import {inject} from '@loopback/core';
import {
  post,
  Request,
  requestBody,
  Response,
  RestBindings
} from '@loopback/rest';
import {FILE_UPLOAD_SERVICE} from '../keys';
import {FileUploadHandler} from '../types';

/**
 * A controller to handle file uploads using multipart/form-data media type
 */
export class FileManagerController {
  /**
   * Constructor
   * @param handler - Inject an express request handler to deal with the request
   */
  constructor(
    @inject(FILE_UPLOAD_SERVICE) private handler: FileUploadHandler,
  ) { }

  @post('/files/upload', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Files',
      },
    },
  })
  async fileUpload(
    @requestBody.file({
      description: 'Binary file to upload',
    })
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      this.handler(request, response, err => {
        if (err) reject(err);
        else {
          const filesUpload = FileManagerController.getFilesAndFields(request);
          const files = filesUpload.files.map((file: any) => file.fileName);
          resolve({message: 'success', files: files});
        }
      });
    });
  }
  private static getFilesAndFields(request: Request) {
    const uploadedFiles = request.files;
    // const thumbnail = request.body?.thumbnail ?? '100x100';
    const mapper = (f: globalThis.Express.Multer.File) => ({
      fileName: f.filename,
      fieldname: f.fieldname,
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
    });
    let files: object[] = [];
    if (Array.isArray(uploadedFiles)) {
      files = uploadedFiles.map(mapper);
    } else {
      for (const filename in uploadedFiles) {
        files.push(...uploadedFiles[filename].map(mapper));
      }
    }
    console.log(files);
    return {files};
  }
}

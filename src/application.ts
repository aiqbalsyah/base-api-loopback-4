import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, extensionFor} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import os from 'os';
import path from 'path';

import {AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {LoggingBindings, LoggingComponent, WINSTON_FORMAT, format} from '@loopback/logging';
import multer from 'multer';
import {MonggoDbDataSource} from './datasources';
import {FILE_UPLOAD_SERVICE, STORAGE_DIRECTORY} from './keys';
import {MySequence} from './sequence';
import {EMAIL_SERVICE, EmailServices} from './services/mailers.service';
export {ApplicationConfig};

export class ApiLoopBackApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Bind the custom logger
    // this.bind('logger').to(logger);
    const customFormat = format.combine(
      format.colorize(),
      format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
      format.errors({stack: true}), // Include the stack trace
      format.printf(({timestamp, level, message, stack, ...metadata}) => {
        let log = `${timestamp} [${level}]: ${message}`;
        if (stack) {
          log += `${os.EOL}${stack}`;
        }
        if (Object.keys(metadata).length > 0) {
          log += ` ${JSON.stringify(metadata)}`;
        }
        return log;
      })
    );
    this
      .bind('logging.winston.formats.customFormat')
      .to(customFormat)
      .apply(extensionFor(WINSTON_FORMAT));

    this.configure(LoggingBindings.WINSTON_HTTP_ACCESS_LOGGER)
      .to({format: 'combined'});

    // Configure the logging component
    this.configure(LoggingBindings.COMPONENT).to({
      enableFluent: false, // Disable Fluent logging
      enableHttpAccessLog: true, // Enable HTTP access logging
    });

    // Add the logging component
    this.component(LoggingComponent);


    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.configureFileUpload(options.fileStorageDirectory);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);
    this.dataSource(
      MonggoDbDataSource,
      UserServiceBindings.DATASOURCE_NAME,
    );
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to('360000');

    this.bind(EMAIL_SERVICE).toClass(EmailServices);
  }
  protected configureFileUpload(destination?: string) {
    // Upload files to `dist/.sandbox` by default
    destination = destination ?? path.join(__dirname, '../public/.sandbox');
    this.bind(STORAGE_DIRECTORY).to(destination);
    const multerOptions: multer.Options = {
      storage: multer.diskStorage({
        destination,
        // Use the original file name as is
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const extension = path.extname(file.originalname); // Preserve the file extension
          const nameWithoutExtension = path.basename(
            file.originalname,
            extension,
          );
          cb(null, `${nameWithoutExtension}-${uniqueSuffix}${extension}`);
        },
      }),
    };
    // Configure the file upload service with multer options
    this.configure(FILE_UPLOAD_SERVICE).to(multerOptions);
  }
}

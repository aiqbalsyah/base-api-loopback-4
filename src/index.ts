import {ApiLoopBackApplication, ApplicationConfig} from './application';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new ApiLoopBackApplication(options);

  await app.boot();

  await app.start();
  const url = app.restServer.url;
  // console.log(`Server is running at ${url}`);

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}

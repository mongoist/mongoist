## Running Tests

Before contributing to this project, it is important to ensure that the code changes made do not introduce any regressions or issues. To verify this, running tests locally is highly recommended.

### Prerequisites

To run the tests, you will need to have the following dependencies set up:

- Node.js and npm (Node Package Manager) installed on your machine.
- A local MongoDB instance running on port 27017.

### Setting up a Local MongoDB Instance

To run the tests, a local MongoDB instance is required. If you don't have MongoDB installed on your machine, you can use Docker to quickly set up a local MongoDB instance. Follow these steps:

1. Install Docker on your machine by visiting the [Docker website](https://www.docker.com/) and following the installation instructions specific to your operating system.

2. Once Docker is installed, open a terminal or command prompt and execute the following command to pull the MongoDB Docker image:

   ```shell
   docker pull mongo
   ```

3. After the Docker image is downloaded, start a MongoDB container by running the following command:

   ```shell
   docker run --name my-mongodb -p 27017:27017 -d mongo
   ```

   This command starts a new Docker container named `my-mongodb`, binds the local port `27017` to the MongoDB default port `27017`, and runs the MongoDB image in detached mode (`-d` flag).

4. Wait for a few seconds until the container is up and running. You now have a local MongoDB instance accessible on port `27017`.

### Running Tests

Once you have set up the local MongoDB instance, you can run the tests using the following npm command:

```shell
npm test
```

This command will execute the test suite defined in the project and provide feedback on the test results.

Running the tests locally helps ensure that your changes integrate seamlessly with the existing codebase and do not introduce any unintended issues. It is highly recommended to run the tests before submitting any contributions or opening pull requests.

Happy testing!

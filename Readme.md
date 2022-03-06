# The Nag App

![Screenshot](https://raw.githubusercontent.com/zackpudil/TheNagApp/main/screenshot.png)

# Development

## Service

### Prerequisites

1. [NodeJS](https://nodejs.org/en/download/)
2. [Npx](https://www.npmjs.com/package/npx)
3. [Docker Desktop](https://www.docker.com/products/docker-desktop)
4. [Docker Compose](https://docs.docker.com/compose/install/)
5. [Ngrok](https://ngrok.com/download)

### Setup

All commands should be ran in the `service/` directory.

Install dependencies
```
npm install
```

Use docker compose to start 2 containers, the first one is the api and the second is the mongo back end.

```
docker-compose up
```

Use ngrok to create a tunnel
```
ngrok http 3000
```
save the tunnel url.
## App

### Prerequisites

1. [Android Studio](https://developer.android.com/studio/?gclid=CjwKCAiAsYyRBhACEiwAkJFKohGv5QBdFOZ2ey2pU2_JlRWihXKITqVtB96NrNYCzgiml3r9Tim0bRoC0OMQAvD_BwE&gclsrc=aw.ds)
2. [NodeJS](https://nodejs.org/en/download/)
3. [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable)
4. [Npx](https://www.npmjs.com/package/npx)
5. [ExpoGo CLI](https://docs.expo.dev/get-started/installation/)
6. [Ngrok](https://ngrok.com/download)

### Setup

All commands should be ran in the `app/` directory.

Install Dependencies
```
yarn install
```

Create an Android AVD in Android AVD Manager (see here: https://developer.android.com/studio/run/managing-avds)
Or download the Expo Go app on your phone.

Update `app/utils/common.js` with ngrok tunnel url from Service setup.

Login in with account to Expo.
```
npx expo login
```

Start app bundler
```
npx expo start
```
use `?` while in shell to learn how to get the app on your emulator or phone.

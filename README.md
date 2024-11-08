# LinkSimplify

LinkSimplify is a powerful and user-friendly URL shortener designed to streamline the sharing of links across various platforms. This project features both a web interface and an API, allowing users to easily create, update, and delete shortened URLs as needed.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication (register, login, logout)
- URL shortening with custom aliases
- Blacklist for custom aliases (reserved keywords)
- URL management (edit, delete)
- URL analytics (click tracking)
- Responsive design
- Secure password storage with bcrypt
- JWT-based authentication
- API Access ( Planned )
- Extendable with additional features ( Planned )
- Docker support ( Planned )
- Demo Deployment ( Planned )
- Custom Domain Support ( Planned )
- QR Code Generation ( Planned )
- Password-protected URLs ( Planned )
- Expiration Dates ( Planned )
- Rate Limiting ( Planned )
- Google Analytics Integration ( Planned )
- Social Media Sharing ( Planned )
- API Key Authentication ( Planned )
- Geo Location Tracking ( Planned )
- Logging and Monitoring ( Planned )
- Spam Protection ( Planned )
- Abuse Prevention ( Planned )
## Installation

To get started with LinkSimplify, follow these steps:

1. Clone the repository:

    ```sh
    git clone https://github.com/mezbaulanam/LinkSimplify.git
    ```

2. Navigate to the project directory:

    ```sh
    cd LinkSimplify
    ```

3. Install the dependencies:

    ```sh
    npm install
    ```

4. Create a `.env` file in the root directory and add your environment variables:

    ```env
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    ```

5. Start the development server:

    ```sh
    npm start
    ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Register a new account or log in with an existing account.
3. Use the URL shortener form to create a new shortened URL.
4. Manage your URLs from the dashboard.


## Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

Made with ❤️ by [mezbaulanam](https://github.com/mezbaulanam)
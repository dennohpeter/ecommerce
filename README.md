#### Ecommerce

#### Install dependencies

```bash
yarn
```

#### Setup Database

```bash
yarn db:setup
```

#### Create a new migration

```bash
yarn migrate create <migration-name>

# Example
yarn migrate create create-users-table

# Example

yarn migrate create create-products-table
```

#### Make migrations

```bash
yarn migrate up
```

#### Rollback migrations

```bash
yarn migrate down
```

#### Create a new seed

```bash

yarn seed create <seed-name>

# Example
yarn seed create create-users-seed

# Example
yarn seed create create-products-seed
```

#### Run seeds

```bash
yarn db:seed
```

#### Run the server

```bash
yarn start
```

#### Run the server in development mode

```bash
yarn dev
```

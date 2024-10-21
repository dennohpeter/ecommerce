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
yarn seed run
```

#### Rollback migrations

```bash
yarn migrate down
```

#### Make migrations

```bash
yarn migrate up
```

#### Run the server

```bash
yarn start
```

#### Run the server in development mode

```bash
yarn dev
```

import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';

const createCategories = async (count = 10) =>
  Array.from({ length: count }, (_, __) => ({
    id: uuidv4(),
    name: faker.commerce.department(),
    picture: faker.image.urlPicsumPhotos(),
    description: faker.commerce.productDescription(),
  }));

const createProducts = async (count = 10) =>
  Array.from({ length: count }, (_, __) => ({
    id: uuidv4(),
    title: faker.commerce.productName(),
    picture: faker.image.urlPicsumPhotos(),
    summary: faker.commerce.productAdjective(),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price(),
    tags: [faker.commerce.productMaterial()],
    quantity: faker.number.int({ min: 1, max: 100 }),
  }));

const Main = async () => {
  let categories = (await query('SELECT * FROM categories', [])).rows;

  console.log(categories);
  if (categories.length === 0) categories = await createCategories();

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    await query(
      'INSERT INTO categories (id, name, picture, description) VALUES ($1, $2, $3, $4)',
      [category.id, category.name, category.picture, category.description],
    );
  }

  console.log(categories.map((category) => category.id));

  const products = (await createProducts()).map((product, idx) => {
    const category_id = categories[idx % categories.length].id;
    return {
      ...product,
      category_id,
    };
  });

  products.map(async (product) => [
    await query(
      'INSERT INTO products (id, title, picture, summary, description, price, tags, category_id, quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        product.id,
        product.title,
        product.picture,
        product.summary,
        product.description,
        product.price,
        product.tags,
        product.category_id,
        product.quantity,
      ],
    ),
  ]);
};

Main();

import { integer, pgTable, varchar} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const wishlistsTable = pgTable("wishlist", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  useremailId: varchar({ length: 255 }).notNull().references(() => usersTable.email),
  productId: integer().notNull().references(() => trending.id),
});

export const trending = pgTable("trending", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  price: integer().notNull(),
  description: varchar({ length: 555 }).notNull(),
  category: varchar({ length: 255 }).notNull(),
  link: varchar({ length: 255 }).notNull(),
  image: varchar({ length: 255 }).notNull(),
  about: varchar({ length: 255 }),
  createdBy: varchar('createdBy').notNull().references(() => usersTable.email),
});

// New products table
// export const productsTable = pgTable("products", {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),
//   url: varchar({ length: 255 }).notNull().unique(),
//   currency: varchar({ length: 10 }).notNull(),
//   image: varchar({ length: 255 }).notNull(),
//   title: varchar({ length: 255 }).notNull(),
//   currentPrice: integer().notNull(),
//   originalPrice: integer().notNull(), // Original price of the product
//   lowestPrice: integer(), // Lowest historical price
//   highestPrice: integer(), // Highest historical price
//   averagePrice: integer(), // Average historical price
//   discountRate: integer().notNull(), // Discount percentage
//   description: varchar({ length: 1000 }), // Detailed product description
//   category: varchar({ length: 255 }), // Product category
//   reviewsCount: integer(), // Number of reviews
//   isOutOfStock: boolean().default(false), // Stock availability
//   createdAt: timestamp().defaultNow(), // Timestamp when the product was created
//   createdBy: varchar("createdBy").references(() => usersTable.email), // Foreign key to usersTable
// });


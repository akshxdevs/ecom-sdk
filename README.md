# Overview

`blockbazzar-sdk` is the official TypeScript SDK for interacting with the **BlockBazzar E-Commerce Program** on Solana.

It provides complete functionality for:

### **Product Management**

* Create product

* Fetch a product

* Fetch all products by seller

* Fetch all products from all sellers

### **Cart Management**

* Add product to cart

* Fetch a single cart item

* Fetch all cart items

### **Escrow + Payment Flow**

* Initialize payment

* Initialize escrow

* Deposit escrow

* Withdraw escrow

* Close escrow & payment accounts

### **Order System**

* Create order

* Fetch order details

* Update order status

The SDK abstracts all PDA derivation, Anchor providers, IDL handling, and account parsing.

You can use it directly inside **Next.js**, **React**, **Node**, or **backend servers**.

---

# Installation

```

pnpm install

```

or

```

npm install 

```

---

# Wallet & Provider Setup

Most SDK functions require a wallet connected via `@solana/wallet-adapter-react`.

```ts

import { Escrow } from "blockbazzar-sdk";

import { useWallet } from "@solana/wallet-adapter-react";

const wallet = useWallet();

const escrow = new Escrow(wallet);

```

The SDK auto-handles:

* Provider creation

* Anchor program loading

* PDA derivations based on program seeds

---

# Quick Example: Full Purchase Flow

```ts

const escrow = new Escrow(wallet);

// Step 1: Init Payment (buyer)

await escrow.initPayment(wallet, 1200);

// Step 2: Create Escrow

await escrow.initEscrow(wallet, buyerPubkey, sellerPubkey, 1200);

// Step 3: Deposit funds

await escrow.initEscrowDeposite(productId, wallet);

// Step 4: Seller Withdraws

await escrow.initEscrowWithdraw(productId, wallet, sellerPubkey, mint);

// Step 5: Create Order

await escrow.initOrder(wallet);

// Step 6: Update Order

await escrow.updateOrder(wallet, "Shipped");

```

---

# SDK API Reference

*(All functions below come directly from your actual code --- nothing invented.)*

---

# PRODUCT MODULE

---

## **createProduct()**

```ts

initCreateProduct(

  walletAdapter,

  product_name,

  product_short_description,

  price,

  category,

  division,

  seller_name,

  product_imgurl

)

```

Creates a new product + product list.

Handles:

* PDA creation

* Category variant

* Division variant

* Price conversion

* Anchor transaction execution

---

## **fetchProduct(productPda)**

Fetch a single product account.

```ts

fetchProduct(productPdaString, walletAdapter)

```

---

## **fetchAllProductsFromSeller(sellerPubkey)**

Fetch products for one seller.

```ts

fetchAllProductsFromSeller(sellerPubkeyString, walletAdapter)

```

---

## **fetchAllProducts()**

Fetch products from all sellers.

```ts

fetchAllProducts(walletAdapter)

```

---

## **formatProductData(data)**

Formats Anchor product struct → clean JS object.

---

---

# CART MODULE

---

## **AddToCart()**

```ts

AddToCart(

  walletAdapter,

  sellerPubkey,

  product_name,

  quantity,

  price,

  product_imgurl

)

```

Creates:

* `cart` PDA

* `cart_list` PDA

And stores product inside cart.

---

## **fetchCart(cartPda)**

```ts

fetchCart(cartPdaString, walletAdapter)

```

Fetches a single cart entry.

---

## **fetchCartList()**

```ts

fetchCartList(walletAdapter)

```

Fetches all cart items for the user.

---

---

# PAYMENT MODULE

*(Inside `Escrow` class)*

---

## **initPayment(totalAmount)**

```ts

initPayment(walletAdapter, totalAmount: number)

```

Creates or fetches a payment PDA.

* Uses `createPayment`

* Stores payment amount

* Stores payment method + status

---

---

# ESCROW MODULE

*(Inside `Escrow` class)*

---

## **initEscrow(buyer, seller, amount)**

```ts

initEscrow(walletAdapter, buyerPubkey, sellerPubkey, totalAmount)

```

Creates:

* escrow PDA

* references payment PDA

* binds buyer + seller

---

## **initEscrowDeposite(productId)**

```ts

initEscrowDeposite(productId, walletAdapter)

```

Deposits SOL into escrow vault.

---

## **initEscrowWithdraw(productId, sellerPubkey, mint)**

```ts

initEscrowWithdraw(productId, walletAdapter, sellerPubkey, mint)

```

Releases funds from escrow to seller.

---

---

# ORDER MODULE

*(Inside `Escrow` class)*

---

## **initOrder()**

```ts

initOrder(walletAdapter)

```

Creates or fetches an order PDA.

Uses:

* Payment ID converted to UUID

* createOrder instruction

---

## **updateOrder(status)**

```ts

updateOrder(walletAdapter, updateStatus: string)

```

Updates:

* order status

* order tracking

---

---

# ACCOUNT CLEANUP MODULE

*(Inside `Escrow` class)*

---

## **closeAccounts()**

```ts

closeAccounts(walletAdapter)

```

Closes:

* Payment PDA

* Escrow PDA

Returns reclaimed lamports to the user.

---

# Project Structure

```

blockbazzar-sdk/

 ├── src/

 │   ├── Escrow.ts      → Escrow + Payment + Order logic

 │   ├── product.ts     → Product & Cart logic

 │   ├── IDL/           → Anchor IDL

 │   ├── utils/         → UUID converter, helpers

 │   └── index.ts       → Exports

 ├── package.json

 ├── tsconfig.json

 └── README.md

```

---

# Disclaimer

This software is provided **"as is"** without warranty.

You assume full responsibility for all blockchain interactions.

Use at your own risk.

Contributing

We welcome contributions! Please submit a pull request or open an issue to discuss any changes.

License

This project is licensed under the MIT License - see the LICENSE file for details.

Here is a sample "Use at Your Own Risk" disclaimer for a GitHub repository:

Disclaimer

This software is provided "as is," without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.

Use at your own risk. The authors take no responsibility for any harm or damage caused by the use of this software. Users are responsible for ensuring the suitability and safety of this software for their specific use cases.

By using this software, you acknowledge that you have read, understood, and agree to this disclaimer.

Feel free to customize it further to suit the specific context and requirements of your project.

By following this README, you should be able to install the PumpDotFun SDK, run the provided examples, and understand how to set up event listeners and perform token operations.

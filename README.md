# 🏦 Scrooge Bank API

A minimalist bank API built with **NestJS**, **Prisma**, and **PostgreSQL** to support checking accounts and personal loans

---

## 📦 Features

* Open/close user bank accounts
* Deposit and withdraw funds
* Apply for 0% interest personal loans
* Repay loans
* View bank financial stats
* Integration tests using Jest + Supertest

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/hsyed01/scrooge-bank-api.git
cd scrooge-bank-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL

Create a database locally and set your environment variable:

```
DATABASE_URL="postgresql://user:password@localhost:5432/scrooge"
```

You can also create a `.env` and `.env.test` file:

```
DATABASE_URL=postgresql://user:password@localhost:5432/scrooge
JWT_SECRET="test-secret"
JWT_EXPIRES_IN="3600s"
```

### 4. Prisma Setup

```bash
npm run db:dev:mgirate
npm run db:dev:seed
```

### 5. Run the App

```bash
npm run start:dev
```

### 6. Run Tests

```bash
npm run test:e2e
```

---

## 📘 API Endpoints

### ✅ Accounts

* `POST /account/:userId` - Open account
* `DELETE /account/:userId` - Close account
* `GET /account/:userId/balance` - View account balance

### 💰 Deposits

* `POST /deposit` - Deposit funds

### 💸 Withdrawals

* `POST /withdraw` - Withdraw funds

### 💳 Loans

* `POST /loan/:userId/apply` - Apply for a loan
* `PATCH /loan/:userId/pay` - Repay loan

### 🏦 Bank

* `GET /bank/stats` - View bank-level stats (capital, deposits, withdrawals, loans given)

---

## ✅ Example cURL

```bash
curl -X POST http://localhost:3000/account/1
curl -X POST http://localhost:3000/deposit -H "Content-Type: application/json" -d '{"amount": 100}'
curl -X POST http://localhost:3000/withdraw -H "Content-Type: application/json" -d '{"amount": 50}'
curl -X POST http://localhost:3000/loan/1/apply -H "Content-Type: application/json" -d '{"amount": 1000}'
curl -X PATCH http://localhost:3000/loan/1/pay -H "Content-Type: application/json" -d '{"amount": 200}'
curl http://localhost:3000/bank/stats
```

---

## ✨ Self-Directed Story

> As a user, I should be able to see my loan balance (total, paid, remaining).

### Endpoint Added:

`GET /loan/:userId` — returns `{ amount, paid, remaining }`

**Why this story?**
It helps users track their repayment status and plan ahead.

**Value Delivered:**
Transparency and confidence in loan management.

---

## 🛠 Tech Stack

* **NestJS**
* **TypeScript**
* **PostgreSQL**
* **Prisma ORM**
* **Jest + Supertest** (testing)

---

## 📄 License

MIT

---

Made with 💰 by \[Haider Syed]

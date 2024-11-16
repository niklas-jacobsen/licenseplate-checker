# Routes

This file provides detailed information on currently available routes and how to use them. \
Testing them locally requires a tool like Postman or Insomnia.

### `GET /`

Returns a default message indicating that the app is running

```
{
    message: 'Licenseplate-Checker running'
}
```

---

### `POST /auth/register`

Register a user account with `email` and `password`

**Request object:**

```
{
    "email": string,
    "password": string,
}
```

**Response object:**

```
{
    "id": string,
    "email": string,
	"password": string,
	"salutation": SalutationList,
	"firstname": string,
	"lastname": string,
	"birthdate": dateTime,
	"street": string,
	"streetNumber": string,
	"zipcode": number,
	"city": string,
	"createdAt": dateTime,
	"updatedAt": dateTime
}
```

---

### `POST /auth/login`

Login with `email` and `password`

**Request object:**

```
{
    "email": string,
    "password": string,
}
```

**Response object:**

```
{
    "message": string,
    "token": string
}
```

---

### `POST /request/new`

Create a new licenseplate request with `city`, `letters` and `numbers`

**Request object:**

```
{
    "city": string,
    "letters": string,
    "numbers": string,
}
```

**Response object:**

```
{
    "message": string
}
```

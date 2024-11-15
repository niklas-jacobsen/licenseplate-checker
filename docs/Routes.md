# Routes

This file provides more detailed information on available routes and how to use them

### `GET /` - Index Route

Returns a default message indicating that the app is running

```
{
    message: 'Licenseplate-Checker running'
}
```

---

### `POST /auth/register` - Register a user account with `email` and `password`

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

### `POST /auth/login` - Login with `email` and `password`

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

### `POST /request/new` - Create a new licenseplate request with `city`, `letters` and `numbers`

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

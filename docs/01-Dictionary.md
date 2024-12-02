# Dictionary

This file gives definitions for frequently used terms throughout this project.

## LicensePlateRequest

> A request created by a user for a personalized license plate.

A licensePlateRequest is a JSON object modelled after the German license plate system consisting of `city`, `letters` and `numbers`. There are certain constraints on how a request can be constructed, which is validated in the backend.

### Object structure

A licensePlateRequest has the following structure:

- `city` accepts only initials that are available as German license plates. User input is matched with a full list of available initials that is stored in the database
- `letters` can be any two-letter combination chosen by the user, but inputs are checked against a list of combinations that are illegal in Germany. Wildcard characters are allowed (explained below).
- `numbers` can be any number from 1 to 9999 but must not contain leading zeros. There are certain numbers illegal in some municipalities, but checking for this is currently out of scope for this project. Wildcard characters are allowed (explained below).

### Wildcard characters

Both `letters` and `numbers` allow for usage of the wildcard characters `'?'` and `'*'`. They are defined as follows:
| | Letters | Numbers | Constraints |
|----------------|--------------|--------------|--------------|
| **'?'-Wildcard** | A-Z | 0-9 | Numbers can only contain a maximum of three `'?'` |
| **'\*'-Wildcard** | AA-ZZ | 1-9999 | Letters and numbers cannot both be `'*'` |

A licensePlateRequest is stored in the database with a reference to the user who created it and information on whether this request has been checked yet by the service

## LicensePlateQuery

> An object parsed from a licensePlateQuery containing no wildcard characters

A licensePlateQuery is stored in the database, linked to the user who created the initial licensePlateRequest, along with its reservation status.

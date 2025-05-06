# Data Abstraction Platform

A web based platform with the goal of giving people the ability to prepare, collect, and explore data.

## Development

Recommended development and production OS environment is debian-based linux.

Click [here](docs/README.md) to begin use or view documentation of the platform.

### Programming languages

| Name              | Version          | Purpose                  |
| ----------------- | ---------------- | ------------------------ |
| Go                | 1.23.1 and above | Backend and CLI tools    |
| HTML/CSS/Markdown |                  | Website and documentaion |
| TypeScript        |                  | Website                  |
| SQL               |                  | Database                 |

### Database

| Name     | Version          | Purpose                                                                                                |
| -------- | ---------------- | ------------------------------------------------------------------------------------------------------ |
| Postgres | 16 and above     | Main Database                                                                                          |
| Nats     | 2.11.3 and above | Cache database / File storage / Potential message brokering system<br>Stores signed in user session id |

### Frameworks and runtimes

| Name      | Version |
| --------- | ------- |
| Node      | 22.15.0 |
| SvelteKit | 5       |

### Miscellaneous

| Name    | Purpose                               |
| ------- | ------------------------------------- |
| PgAdmin | Visually administer postgres database |
| Bruno   | Tool for API testing                  |
| Drawio  | Diagram creation tool                 |

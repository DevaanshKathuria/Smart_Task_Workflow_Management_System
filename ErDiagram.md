# Entity Relationship (ER) Diagram

## Entities and Attributes

### users
- id (Primary Key)
- name
- email
- password
- role

### projects
- id (Primary Key)
- name
- description
- start_date
- end_date

### tasks
- id (Primary Key)
- title
- description
- status
- priority
- due_date
- project_id (Foreign Key → projects.id)
- assigned_to (Foreign Key → users.id)

### notifications
- id (Primary Key)
- message
- created_at
- user_id (Foreign Key → users.id)

## Relationships
- One user can be assigned many tasks
- One project can have many tasks
- One user can receive many notifications
# Metadata Model

A metadata model can be defined as information about a set of data or datum.

Such information contains properties about fields or columns of a piece of data which can be used for various purposes such as:

- Viewing data in a table.
- Generating an interface for inputting data in a form or table.
- Generating an interface for preparing filter/query information for data like in graphql.
- Converting the data from different formats i.e., from Array of JSON to 2 Dimension Array and vice versa.

Using this system allows us to build a platform that can handle a mix of structured and unstructurec data with ease.

The metadata-model itself is typically in `json` format.

To incorporate this system, a platform must offer functions, utilities, and UI components as described below:

- Table UI Component - View data that follows a particular metadata model structure. Component can simply take in the metadata model and data as `props` or `arguments` then proceed to display the data.

- Data Input UI Component - The component generates a UI in table/form format based on a metadata model structure.

- Query UI Component = The component generates a UI that can be used for the following purposes
  - Augmenting a metadata model structure properties such as enabling or disabling view of a field/column.
  - Generating filter conditions that can be executed when fetching data from a database.

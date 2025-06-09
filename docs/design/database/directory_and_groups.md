# Directory and Groups

# Table Contents

- [Physical ERD](#physical-erd)
- [Table Descriptions](#table-descriptions)
  - [Directory](#directory)
  - [Directory Authorization IDs](#directory-authorization-ids)
  - [Directory Groups](#directory-groups)
  - [Directory Groups Authorization IDs](#directory-groups-authorization-ids)
  - [Directory Groups Sub Groups](#directory-groups-sub-groups)

# Physical ERD

![Directory and Groups Physical ERD](../../assets/database/directory_and_groups.svg)

# Table Descriptions

The table below describes the different tables in the above ERD.

<table>
    <thead>
        <th>Table</th>
        <th>Description</th>
    </thead>
    <tbody>
    </tbody>
    <tr>
        <td>directory_groups</td>
        <td>
            <div>Group for users created by different people in the system that serve a common purpose.</div>
            <div>Every resource in the system e.g. files, metadata_models, abstractions etc., belong to a group.</div>
        </td>
    </tr>
    <tr>
        <td>directory</td>
        <td>
            <div>People such as group users created by different people in the system</div>
            <div>Most resources in the system e.g. files, metadata_models, abstractions etc., are owned by a particular person.</div>
        </td>
    </tr>
    <tr>
        <td>directory_groups_sub_groups</td>
        <td>
            <div>Links sub_groups to their parent_groups</div>
        </td>
    </tr>
    <tr>
        <td>directory_authorization_ids</td>
        <td>
            <div>Roles (iam_group_authorizations) that were used to create and/or deactivate the resources.</div>
        </td>
    </tr>
    <tr>
        <td>directory_groups_authorization_ids</td>
        <td>
            <div>Roles (iam_group_authorizations) that were used to create and/or deactivate the resources.</div>
        </td>
    </tr>
</table>

## Directory

<table>
    <thead>
        <th>Column</th>
        <th>Description</th>
    </thead>
    <tbody>
        <tr>
            <td>id</td>
            <td>
                <div><code>PK</code> <code>uuid</code> <code>NOT NULL</code></div>
                <div>ID of user/person in the system.</div>
                <div>Used to link a user/person to the resources they own.</div>
            </td>
        </tr>
        <tr>
            <td>directory_groups_id</td>
            <td>
                <div><code>uuid</code> <code>NOT NULL</code></div>
                <div>ID of group which the user/person belongs to.</div>
            </td>
        </tr>
        <tr>
            <td>display_name</td>
            <td>
                <div><code>text</code> <code>NOT NULL</code></div>
                <div>Alternative text value to display when item is being viewed.</div>
            </td>
        </tr>
        <tr>
            <td>data</td>
            <td>
                <div><code>jsonb</code></div>
                <div>Stores unstructureed data about the group following the <a href="../metadata_model/README.md"> metadata modelling system</a>.</div>
            </td>
        </tr>
        <tr>
            <td>created_on</td>
            <td>
                <div><code>timestamp without time zone</code> <code>NOT NULL</code></div>
                <div>Defaults to current timestamp</div>
                <div>Timestamp of creation of data.</div>
            </td>
        </tr>
        <tr>
            <td>last_updated_on</td>
            <td>
                <div><code>timestamp without time zone</code> <code>NOT NULL</code></div>
                <div>Defaults to current timestamp</div>
                <div>Timestamp data was last updated.</div>
            </td>
        </tr>
        <tr>
            <td>deactivated_on</td>
            <td>
                <div><code>timestamp without time zone</code></div>
                <div>Timestamp data was deactivated. Deletion failed since data is a foreign key elsewhere.</div>
            </td>
        </tr>
        <tr>
            <td>full_text_search</td>
            <td>
                <div><code>tsvector</code></div>
                <div>Text vector information that can be used to search data using full text search.</div>
                <div>Source of data: display_name, data</div>
            </td>
        </tr>
    </tbody>
</table>

## Directory Groups

<table>
    <thead>
        <th>Column</th>
        <th>Description</th>
    </thead>
    <tbody>
        <tr>
            <td>id</td>
            <td>
                <div><code>PK</code> <code>uuid</code> <code>NOT NULL</code></div>
                <div>ID of group in the system.</div>
                <div>Used to group together resources in the system.</div>
            </td>
        </tr>
        <tr>
            <td>display_name</td>
            <td>
                <div><code>text</code> <code>NOT NULL</code></div>
                <div>Alternative text value to display when item is being viewed.</div>
            </td>
        </tr>
        <tr>
            <td>description</td>
            <td>
                <div><code>text</code></div>
                <div>Brief description of the group. Like purpose.</div>
            </td>
        </tr>
        <tr>
            <td>data</td>
            <td>
                <div><code>jsonb</code></div>
                <div>Stores unstructureed data about the group following the <a href="../metadata_model/README.md"> metadata modelling system</a>.</div>
            </td>
        </tr>
        <tr>
            <td>created_on</td>
            <td>
                <div><code>timestamp without time zone</code> <code>NOT NULL</code></div>
                <div>Defaults to current time</div>
                <div>Timestamp of creation of data.</div>
            </td>
        </tr>
        <tr>
            <td>last_updated_on</td>
            <td>
                <div><code>timestamp without time zone</code> <code>NOT NULL</code></div>
                <div>Defaults to current time</div>
                <div>Timestamp data was last updated.</div>
            </td>
        </tr>
        <tr>
            <td>deactivated_on</td>
            <td>
                <div><code>timestamp without time zone</code></div>
                <div>Timestamp data was deactivated. Deletion failed since data is a foreign key elsewhere.</div>
            </td>
        </tr>
        <tr>
            <td>full_text_search</td>
            <td>
                <div><code>tsvector</code></div>
                <div>Text vector information that can be used to search data using full text search.</div>
                <div>Source of data: display_name, data</div>
            </td>
        </tr>
    </tbody>
</table>

## Directory Authorization IDs

<table>
    <thead>
        <th>Column</th>
        <th>Description</th>
    </thead>
    <tbody>
        <tr>
            <td>id</td>
            <td>
                <div><code>PK</code> <code>FK</code> <code>uuid</code> <code>NOT NULL</code></div>
                <div>Links to <code>directory.id</code></div>
            </td>
        </tr>
        <tr>
            <td>creation_iam_group_authorizations_id</td>
            <td>
                <div><code>FK</code> <code>uuid</code> <code>NOT NULL</code></div>
                <div>Links to <code>iam_group_authorization.id</code></div>
                <div>Roles (iam_group_authorizations) that were used to create the resources.</div>
            </td>
        </tr>
        <tr>
            <td>deactivation_iam_group_authorizations_id</td>
            <td>
                <div><code>FK</code> <code>uuid</code> <code>NOT NULL</code></div>
                <div>Links to <code>iam_group_authorization.id</code></div>
                <div>Roles (iam_group_authorizations) that were used to delete/deactivate the resources.</div>
            </td>
        </tr>
    </tbody>
</table>

## Directory Groups Authorization IDs

<table>
    <thead>
        <th>Column</th>
        <th>Description</th>
    </thead>
    <tbody>
        <tr>
            <td>id</td>
            <td>
                <div><code>PK</code> <code>FK</code> <code>uuid</code> <code>NOT NULL</code></div>
                <div>Links to <code>directory_groups.id</code></div>
            </td>
        </tr>
        <tr>
            <td>creation_iam_group_authorizations_id</td>
            <td>
                <div><code>FK</code> <code>uuid</code> <code>NOT NULL</code></div>
                <div>Links to <code>iam_group_authorization.id</code></div>
                <div>Roles (iam_group_authorizations) that were used to create the resources.</div>
            </td>
        </tr>
        <tr>
            <td>deactivation_iam_group_authorizations_id</td>
            <td>
                <div><code>FK</code> <code>uuid</code> <code>NOT NULL</code></div>
                <div>Links to <code>iam_group_authorization.id</code></div>
                <div>Roles (iam_group_authorizations) that were used to delete/deactivate the resources.</div>
            </td>
        </tr>
    </tbody>
</table>

## Directory Groups Sub Groups

<table>
    <thead>
        <th>Column</th>
        <th>Description</th>
    </thead>
    <tbody>
        <tr>
            <td>parent_group_id</td>
            <td>
                <div><code>PK</code> <code>FK</code> <code>uuid</code> <code>NOT NULL</code></div>
                <div>Links to <code>directory_groups.id</code></div>
                <div>Parent group of subgroup.</div>
            </td>
        </tr>
        <tr>
            <td>sub_group_id</td>
            <td>
                <div><code>PK</code> <code>FK</code> <code>uuid</code> <code>NOT NULL</code></div>
                <div>Links to <code>directory_groups.id</code></div>
                <div>Child group of parent group.</div>
            </td>
        </tr>
    </tbody>
</table>
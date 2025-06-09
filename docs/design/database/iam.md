# IAM

# Table Contents

- [Physical ERD](#physical-erd)
- [Table Descriptions](#table-descriptions)
  - [Iam Credentials](#iam-credentials)
  - [Group Authorization Rules](#group-authorization-rules)
  - [Group Authorization Rules Tags](#group-authorization-rules-tags)
  - [Group Rule Authorizations](#group-rule-authorizations)
  - [Group Rule Authorizations IDs](#group-rule-authorizations-ids)
  - [Iam Group Authorizations](#iam-group-authorizations)
  - [Iam Group Authorizations IDs](#iam-group-authorizations-ids)

# Physical ERD

![Iam Physical ERD](../../assets/database/iam.svg)

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
        <td>iam_credentials</td>
        <td>
            <div>Stores user/people authentication credentials for uniquely identifying them in the platform.</div>
        </td>
    </tr>
    <tr>
        <td>group_authorization_rules</td>
        <td>
            <div>Roles that can be assigned to groups (directory_groups) and therefore users(iam_credentials).</div>
        </td>
    </tr>
    <tr>
        <td>group_authorization_rules_tags</td>
        <td>
            <div>Use tags to quicky identify a set of authorization rules .e.g. system admin.</div>
        </td>
    </tr>
    <tr>
        <td>group_rule_authorizations</td>
        <td>
            <div>Roles (group_authorization_rules) assigned to groups (directory_groups).</div>
        </td>
    </tr>
    <tr>
        <td>group_rule_authorizations_ids</td>
        <td>
            <div>Roles (iam_group_authorizations) that were used to create and/or deactivate the resources.</div>
        </td>
    </tr>
    <tr>
        <td>iam_group_authorizations</td>
        <td>
            <div>Roles (group_rule_authorizations) assigned to users (iam_credentials).</div>
        </td>
    </tr>
    <tr>
        <td>iam_group_authorizations_ids</td>
        <td>
            <div>Roles (iam_group_authorizations) that were used to create and/or deactivate the resources.</div>
        </td>
    </tr>
</table>

## Iam Credentials

<table>
    <thead>
        <th>Column</th>
        <th>Description</th>
    </thead>
    <tbody>
        <tr>
            <td>id</td>
            <td>
                <div><code>PK</code> <code>text</code> <code>NOT NULL</code></div>
                <div>ID of user authentication credential.</div>
            </td>
        </tr>
        <tr>
            <td>directory_id</td>
            <td>
                <div><code>FK</code> <code>uuid</code></div>
                <div>Links to <code>directory.id</code></div>
            </td>
        </tr>
        <tr>
            <td>username</td>
            <td>
                <div><code>text</code> <code>NOT NULL</code> <code>UNIQUE</code></div>
                <div>Must only allow alpha numeric characters with no spaces.</div>
            </td>
        </tr>
        <tr>
            <td>last_name</td>
            <td>
                <div><code>text</code> <code>NOT NULL</code></div>
                <div>Must only allow alphabetic characters with no spaces.</div>
            </td>
        </tr>
        <tr>
            <td>first_name</td>
            <td>
                <div><code>text</code> <code>NOT NULL</code></div>
                <div>Must only allow alphabetic characters with no spaces.</div>
            </td>
        </tr>
        <tr>
            <td>email</td>
            <td>
                <div><code>text</code> <code>NOT NULL</code></div>
                <div>Must only allow valid email address.</div>
            </td>
        </tr>
        <tr>
            <td>email_verified_on</td>
            <td>
                <div><code>timestamp without time zone</code></div>
                <div>Timestamp when email was verified.</div>
            </td>
        </tr>
        <tr>
            <td>phone_number_country_code</td>
            <td>
                <div><code>integer</code> <code>NOT NULL</code></div>
            </td>
        </tr>
         <tr>
            <td>phone_number</td>
            <td>
                <div><code>integer</code> <code>NOT NULL</code></div>
            </td>
        </tr>
        <tr>
            <td>phone_number_verified_on</td>
            <td>
                <div><code>timestamp without time zone</code></div>
                <div>Timestamp when phone number was verified.</div>
            </td>
        </tr>
        <tr>
            <td>passcode</td>
            <td>
                <div><code>text</code></div>
                <div>Hashed secret used to identify user during sign in.</div>
            </td>
        </tr>
        <tr>
            <td>passcode_last_updated_on</td>
            <td>
                <div><code>timestamp without time zone</code></div>
                <div>Timestamp when passcode was last change.</div>
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
            <td>expires_on</td>
            <td>
                <div><code>timestamp without time zone</code></div>
                <div>Timestamp data beyond which credentials cannot be used for authentication.</div>
            </td>
        </tr>
        <tr>
            <td>full_text_search</td>
            <td>
                <div><code>tsvector</code></div>
                <div>Text vector information that can be used to search data using full text search.</div>
                <div>Source of data: username, last_name, first_name, email, phone_number_country_code, phone_number</div>
            </td>
        </tr>
    </tbody>
</table>

## Group Authorization Rules

<table>
    <thead>
        <th>Column</th>
        <th>Description</th>
    </thead>
    <tbody>
        <tr>
            <td>id</td>
            <td>
                <div><code>PK</code> <code>text</code> <code>NOT NULL</code></div>
                <div>Action of role that can be performed.</div>
            </td>
        </tr>
        <tr>
            <td>rule_group</td>
            <td>
                <div><code>PK</code> <code>text</code> <code>NOT NULL</code></div>
                <div>Section where role can be performed.</div>
            </td>
        </tr>
        <tr>
            <td>description</td>
            <td>
                <div><code>FK</code> <code>text</code> <code>NOT NULL</code></div>
                <div>Description of role.</div>
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
            <td>full_text_search</td>
            <td>
                <div><code>tsvector</code></div>
                <div>Text vector information that can be used to search data using full text search.</div>
                <div>Source of data: id, rule_group, description</div>
            </td>
        </tr>
    </tbody>
</table>

## Group Authorization Rules Tags

<table>
    <thead>
        <th>Column</th>
        <th>Description</th>
    </thead>
    <tbody>
        <tr>
            <td>id</td>
            <td>
                <div><code>PK</code> <code>text</code> <code>NOT NULL</code></div>
                <div>Tag ID.</div>
            </td>
        </tr>
        <tr>
            <td>group_authorization_rules_id</td>
            <td>
                <div><code>FK</code> <code>text</code> <code>NOT NULL</code></div>
                <div>Links to <code>group_authorization_rules.id</code></div>
                <div>Action of role (group_authorization_rules) that is assigned.</div>
            </td>
        </tr>
        <tr>
            <td>group_authorization_rules_group</td>
            <td>
                <div><code>FK</code> <code>text</code> <code>NOT NULL</code></div>
                <div>Links to <code>group_authorization_rules.rule_group</code></div>
                <div>Section of role (group_authorization_rules) that is assigned.</div>
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
            <td>full_text_search</td>
            <td>
                <div><code>tsvector</code></div>
                <div>Text vector information that can be used to search data using full text search.</div>
                <div>Source of data: id, rule_group, description</div>
            </td>
        </tr>
    </tbody>
</table>

## Group Rule Authorizations

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
                <div>ID of role assigned to group (directory_groups).</div>
            </td>
        </tr>
        <tr>
            <td>directory_groups_id</td>
            <td>
                <div><code>FK</code> <code>uuid</code> <code>NOT NULL</code></div>
                <div>Links to <code>directory_groups.id</code></div>
                <div>ID of group (directory_groups) that is assigned role.</div>
            </td>
        </tr>
        <tr>
            <td>group_authorization_rules_id</td>
            <td>
                <div><code>FK</code> <code>text</code> <code>NOT NULL</code></div>
                <div>Links to <code>group_authorization_rules.id</code></div>
                <div>Action of role (group_authorization_rules) that is assigned.</div>
            </td>
        </tr>
        <tr>
            <td>group_authorization_rules_group</td>
            <td>
                <div><code>FK</code> <code>text</code> <code>NOT NULL</code></div>
                <div>Links to <code>group_authorization_rules.rule_group</code></div>
                <div>Section of role (group_authorization_rules) that is assigned.</div>
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
            <td>deactivated_on</td>
            <td>
                <div><code>timestamp without time zone</code></div>
                <div>Timestamp data was deactivated. Deletion failed since data is a foreign key elsewhere.</div>
            </td>
        </tr>
    </tbody>
</table>

## Group Rule Authorizations IDs

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
                <div>Links to <code>group_rule_authorizations.id</code></div>
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

## Iam Group Authorizations

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
                <div>ID of role assigned to user (iam_credentials).</div>
            </td>
        </tr>
        <tr>
            <td>iam_credentials_id</td>
            <td>
                <div><code>FK</code> <code>uuid</code> <code>NOT NULL</code></div>
                <div>Links to <code>iam_credentials.id</code></div>
                <div>ID of user (iam_credentials) that is assigned role.</div>
            </td>
        </tr>
        <tr>
            <td>group_rule_authorizations_id</td>
            <td>
                <div><code>FK</code> <code>uuid</code> <code>NOT NULL</code></div>
                <div>Links to <code>group_rule_authorizations.id</code></div>
                <div>ID of group role (group_rule_authorizations) that is assigned.</div>
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
            <td>deactivated_on</td>
            <td>
                <div><code>timestamp without time zone</code></div>
                <div>Timestamp data was deactivated. Deletion failed since data is a foreign key elsewhere.</div>
            </td>
        </tr>
    </tbody>
</table>

## Iam Group Authorizations IDs

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
                <div>Links to <code>iam_group_authorizations.id</code></div>
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

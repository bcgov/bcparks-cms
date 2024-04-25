# Scripts to import/export Strapi data

## USE WITH CAUTION

These scripts are intended to do a bulk copy of Strapi content from one environment to another (e.g. from prod to test).

Import will wipe out all data in the target environment. If there are schema changes (e.g. a new column on a table),
those will also be lost.

The following tables are ignored:

* Strapi user and permission data (this means the user who created a page may be lost)
* "Core" Strapi configuration values
* API tokens
* Uploaded files; the expectation is that all image references use URLs

## Requirements

Requires installation of the [Openshift CLI](https://docs.openshift.com/container-platform/4.9/cli_reference/openshift_cli/getting-started-cli.htm)
and [PowerShell](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell?view=powershell-7.2).

Users will require access to the appropriate OpenShift project, and will need to login via ``oc login`` prior to import/export.

Note: Windows users need to run the PowerShell scripts from Windows Subsystem for Linux for 
these instructions to work. Depending on your git checkout config you may also also have to convert CRLF 
to CR in the PowerShell scripts (using notepad++) before it will work on WSL.

## Export data

Running the following command will copy a data dump to the db-export subfolder of the current directory
on your local system:

```shell
pwsh export-db.ps1 -Project c1643c-test -OutputPath ./
```

This script dumps data to a temporary folder on one of the Patroni OpenShift pods and then syncs it locally.

## Import data

Running the following command will update the dev db with a previously generated export:

```shell
pwsh import-db.ps1 -Project c1643c-dev
```

This script syncs a local export.sql file to a temporary directory on the leader Patroni pod, and imports
it using psql.

## Import data to your local PostgreSQL database (Docker Desktop)

Note: If you are on Windows, run this from the real PowerShell, not from Windows Subsystem for Linux 
(assuming you have Docker Desktop running on Windows and not on WSL)

```
docker cp ./export.sql postgres-docker:/tmp/db-export.sql
docker exec postgres-docker /bin/bash -c "PGUSER=postgres PGPASSWORD=postgres psql cms < /tmp/db-export.sql"
```


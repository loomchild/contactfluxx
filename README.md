# Contactfluxx
Application that creates connection between Flux and FullContact

## Use-cases
User connects contact book with flux. A flux data flow isolates email addresses and company domains which is a derivative of the email addresses. Once a Flux Key is updated, a request is sent to the full contact platform which fetches details for people via their email addresses and company information via thier domain. Each key will have their own seperate binding to the application which allows a user to get values for each key independently.

A user would like to be able to populate each key with any number of emails, or company domains and for the response to be returned into the flux environment. The application will create bindings to an {email key data in}, {company key data in}, {email key data out}, {company key data out}, {error key data out}.

We will use the [unifluxx](https://github.com/ArcDoxDev/Unifluxx) application as a startpoint for development.

### Unifluxx overview
Provides:
* User Login to flux platform
* Application authentication with 3rd party API.
* Client side UI that allows user input and select from available projects/keys.
* Websockets to connect source key with app.
* Server logic to process source key values and send requests to 3rd party API.
* Rate limit control on requests to the 3rd party API.
* Error handling for responses.
* Push response back to key in Flux.


### Developer Glossary

* Flux flow - A visual data flow programming environment that is provided to the end-users to interact with data keys
* Data Keys - The data tables reference to a single encapsulated piece of data. Also can be called a data cell.
* Data Table - Flux uses data tables as a concept for data tables like excel does.

### Get from another API the eircode

If a company does not have an associated Eircode, run a search against autoaddress so that it will take the Eircode and repopulate the response "postcode" field.
First, we need to check if the address country is Irish, in organization/contactInfo/addresses/{for each}, if so, send get request with concat(addressLine1 + addressLine2).
Return to a GUI, the result for the user to select. Allow user select "done", when "done" update the organization/contactInfo/addresses/{address #}/postalCode field, then return to flux the result.  

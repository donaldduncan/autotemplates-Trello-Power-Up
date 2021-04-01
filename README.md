# Card template automation Trello Power-Up 🚀

Hi there 👋

This is a Trello Power-Up which is intended to run on glitch.com. The debugger doesn't work in VSCode or on Glitch for the back-end, so I set up a local version, using ngrok to expose the localhost API. This works for development and testing, and I plan to strip it back down and upload to Glitch once complete, before submitting to Trello for release on their Power-Up platform. (They accept Glitch-hosted apps - Glitch is also owned by Atlassian).

When running, and the Power-Up is added to a Trello Board, this happens:

> User creates template card (using Trello functionality).
> User chooses the List(s) the template card will apply to from a dropdown menu on the template card.
> When cards are added to that List:
>> Checklists and missing checklist items are added from the Template card.
>> Description from template is appended to the new card.
>> Due date is added from template card. 
> A menu button on the Board provides interactive access to all the template cards on the board.

Currently working on authorisation, which is working, but is not successfully removed when a user clicks the 'Delete all data' button, if they decide to stop using the Power-Up.

For the C# + Angular version of this for local hosting, see the other repository.

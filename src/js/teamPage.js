function retrieveGetParameters(){
    let parameters = {}
    window.location.search
        .substring(1)                                       //Remove '?' at beginning
        .split('&')                                         //Split key-value pairs
        .map((currentElement) => {                          //Fill parameters object with key-value pairs
            const key = currentElement.split('=')[0];
            const value = currentElement.split('=')[1];
            parameters[key] = value;
        })
    return parameters;
}

function getTeamname(){
    const parameters = retrieveGetParameters();
    return parameters["teamname"];
}

function updateTeamname(){
    $('h1')
        .text(getTeamname())
    $('#teamname_input')
        .val(getTeamname());
    $('#teamname_for_selector')
        .val(getTeamname());
}

function getAllSuggestions(){
    let suggestions;
    $.ajax({
        url: '/pizzas/suggestions/?teamname='+getTeamname(),
        success: (res) => {
            suggestions = JSON.parse(res);
        },
        method: "GET",
        async: false
    })
    return suggestions
}

function vote(value, id){
    const voteObject = {
        teamname: getTeamname(),
        id: id,
        vote: value
    };

    $.ajax({
        url: '/pizzas/suggestions/vote',
        data: voteObject,
        success: () => {
            console.log("Your vote has been sent to the server.")
        }
    })
}

/**
 * Generate DOM structure for a pizza topping suggestion
 * @param id suggestion ID assigned by the backend for this suggestion
 * @param headingText text to be displayed in header of the suggestion
 * @param voteCount number of votes this suggestion has already received
 * @param success {boolean} whether this topping is currently successful and will be chose
 * @param ingredients list of ingredients used as pizza topping suggestion
 * @returns {*|jQuery}
 */
function generateSuggestionPanel(id, headingText, voteCount, success, ingredients){
    const ingredientsList = ingredients
        .reduce((acc, val) => {
            return acc + val + "<br>"
        }, "")
    const $headingRow = $('<div></div>')
        .addClass('row');
    const $h4 = $('<h4></h4>')
    const $panelHeadingText = $('<div></div>')
        .addClass('col-sm-6');
    const $panelHeadingVote = $('<div></div>')
        .addClass('col-sm-6')
    const $elementGroup = $('<div></div>')
        .addClass('element-group')

                                const $posButton = $('<button></button>')
                                    .attr('type', 'button')
                                    .addClass('btn btn-success btn-xs')
                                    .text('+')
                                const $voteCount = $('<span></span>')
                                    .addClass('label label-default label-sm')
                                    .text(voteCount)
                                const $negButton = $('<button></button>')
                                    .attr('type', 'button')
                                    .addClass('btn btn-danger btn-xs')
                                    .text('-')

                            const $voteComponent = $($elementGroup)
                                .append($posButton)
                                .append($voteCount)
                                .append($negButton)

                        const $voteColumn = $($panelHeadingVote)
                            .append($voteComponent)

                        const $headingTextColumn = $($panelHeadingText)
                            .text(headingText)

                    const $header = $($h4)
                        .append($headingTextColumn)
                        .append($voteColumn)

                const $completeHeadingRow = $($headingRow)
                    .append($header)

            const $panelHeading = $('<div></div>')
                .addClass('panel-heading')
                .append($completeHeadingRow)

            const $panelBody = $('<div></div>')
                .addClass('panel-body')
                .html(ingredientsList.slice(0, -4))

        const $panel = $('<div></div>')
            .addClass('panel ' + ((success)? 'panel-success' : 'panel-danger'))
            .append($panelHeading)
            .append($panelBody)

    const $panelColumn = $('<div></div>')
        .addClass('col-sm-4')
        .attr('suggestion-id', id)
        .append($panel)

    return $panelColumn;
}

window.addEventListener('load', () => {
    updateTeamname();
    suggestions = getAllSuggestions();

    suggestions.sort(function(a,b) { return (a.vote > b.vote) ? -1 : ((a.vote < b.vote) ? 1 : 0);} );
    
    suggestions.forEach(function(element) {
        $('#panelContainer')
            .append(generateSuggestionPanel(element.id, "Hälfte " + element.id, element.vote, true, element.ingredients));
    });
    
    //$('#panelContainer')
      //  .append(generateSuggestionPanel(501, "Hälfte 1", 33, true, ["Thunfisch", "Salami", "Honig"]))
})

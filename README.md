# angular-selector-queries

Selector queries and responsive containers

This script allows you to apply different class values to 
an HTML element based on its width. Use it as follows:

Call the ngSelectorQueries module in your module definition:

    angular.module('FooApp', [ 'ngSelectorQueries' ]);


Use the directive as you normally would in your template, using the classical notation:

    <div ng-sq="min-width:400px=wide max-width:10em=small">
        <p>Content here</p>
    </div>

This will apply a class of `wide` when the element is wider than 400 
pixels and a class of `small` when it is narrower than 10 ems.
Use this notation for multiple attributes (`min-width` and `max-width` are supported).

Or for single attributes in a more angularish style:

    <div ng-sq ng-sq-min-width="400px" ng-sq-class="small">
        <p>Content here</p>
    </div>

**NOTE:** At this moment, multiple attributes are suported using the classical notation only.
    

That's all.

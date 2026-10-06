<x-error-page
    :code="$exception->getStatusCode()"
    title="Something went wrong"
    message="We are having trouble processing your request. Please try again in a moment."
    :retry="true"
/>

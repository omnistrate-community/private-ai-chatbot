#!/usr/bin/env bash
set -Ex

function apply_patch {

    echo "Check that we have NEXT_PUBLIC_API_BASE_URL vars"
    test -n "$NEXT_PUBLIC_API_BASE_URL"

    # Remove trailing slashes
    export NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL%/}"
    echo "NEXT_PUBLIC_API_BASE_URL: $NEXT_PUBLIC_API_BASE_URL"
    echo "Patching Nextjs"
    find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_API_BASE_URL#$NEXT_PUBLIC_API_BASE_URL#g"
}

apply_patch
echo "Starting Nextjs"
exec "$@"
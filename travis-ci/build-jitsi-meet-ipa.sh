#!/bin/bash
set -e

echo "TRAVIS_BRANCH=${TRAVIS_BRANCH}"
echo "TRAVIS_REPO_SLUG=${TRAVIS_REPO_SLUG}"

PR_BRANCH=${TRAVIS_PULL_REQUEST_BRANCH:-$TRAVIS_BRANCH}

echo "PR_BRANCH=${PR_BRANCH}"

# FIXME this is duplicated logic from jitsi-meet script
if [ $PR_BRANCH != "master" ]; then
    echo "Will merge lib-jitsi-meet ${PR_BRANCH} into the master"
    git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
    git fetch origin master
    git checkout master
    git merge $PR_BRANCH --no-edit
fi

git log -20 --graph --pretty=format':%C(yellow)%h%Cblue%d%Creset %s %C(white) %an, %ar%Creset'

# Clone Jitsi Meet
JITSI_MEET_BRANCH=${PR_BRANCH}
JITSI_MEET_REPO_SLUG="${TRAVIS_REPO_SLUG/lib-jitsi-meet/jitsi-meet}"
JITSI_MEET_REPO_URL=https://github.com/${JITSI_MEET_REPO_SLUG}.git

# Check if corresponding PR branch exists in the jitsi-meet repo
if [[ -z "$(git ls-remote --heads ${JITSI_MEET_REPO_URL} ${JITSI_MEET_BRANCH})" ]]
then
    echo "${JITSI_MEET_BRANCH} does not exist in jitsi-meet repo. Falling back to master..."
    JITSI_MEET_BRANCH="master"
fi

echo "Selected jitsi-meet branch: ${JITSI_MEET_BRANCH}"

# Checkout jitsi-meet
cd ..
echo "Git clone..."
git clone --depth=50 --branch=${JITSI_MEET_BRANCH} ${JITSI_MEET_REPO_URL} jitsi-meet
echo "cd to jitsi-meet root..."
cd jitsi-meet

sed -i.bak -e "s/\"lib-jitsi-meet.*/\"lib-jitsi-meet\"\: \"file:..\/lib-jitsi-meet\",/g" package.json

echo "Executing build-ipa script in jitsi-meet..."

. ./ios/travis-ci/build-ipa.sh

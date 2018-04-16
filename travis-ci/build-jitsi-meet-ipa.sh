#!/bin/bash
set -e

echo "TRAVIS_BRANCH=${TRAVIS_BRANCH}"
echo "TRAVIS_REPO_SLUG=${TRAVIS_REPO_SLUG}"

if [ -z $PR_REPO_SLUG ]; then
    echoSleepAndExit1 "No PR_REPO_SLUG defined"
fi
if [ -z $PR_BRANCH ]; then
    echoSleepAndExit1 "No PR_BRANCH defined"
fi
if [ -z $IPA_DEPLOY_LOCATION ]; then
    echoSleepAndExit1 "No IPA_DEPLOY_LOCATION defined"
fi

echo "PR_REPO_SLUG=${PR_REPO_SLUG} PR_BRANCH=${PR_BRANCH}"

# FIXME this is duplicated logic from jitsi-meet script
if [ $PR_BRANCH != "master" ]; then
    echo "Will merge lib-jitsi-meet ${PR_REPO_SLUG}/${PR_BRANCH} into master"
    git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
    git fetch origin master
    git checkout master
    git pull https://github.com/${PR_REPO_SLUG}.git $PR_BRANCH --no-edit
fi

git log -20 --graph --pretty=format':%C(yellow)%h%Cblue%d%Creset %s %C(white) %an, %ar%Creset'

# Clone Jitsi Meet
JITSI_MEET_BRANCH=${PR_BRANCH}
JITSI_MEET_REPO_SLUG=${PR_REPO_SLUG/lib-jitsi-meet/jitsi-meet}
JITSI_MEET_REPO_URL=https://github.com/${JITSI_MEET_REPO_SLUG}.git

# Check if corresponding PR branch exists in the jitsi-meet repo
if [[ -z "$(git ls-remote --heads ${JITSI_MEET_REPO_URL} ${JITSI_MEET_BRANCH})" ]]
then
    echo "${JITSI_MEET_BRANCH} does not exist in ${JITSI_MEET_REPO_URL}..."

    # If the PR is for other repo then check if this branch exists on the jitsi repo
    if [ $PR_REPO_SLUG != $TRAVIS_REPO_SLUG ];
    then
        JITSI_MEET_REPO_SLUG=${TRAVIS_REPO_SLUG/lib-jitsi-meet/jitsi-meet}
        JITSI_MEET_REPO_URL=https://github.com/${JITSI_MEET_REPO_SLUG}.git
        echo "Looking for ${JITSI_MEET_BRANCH} on ${JITSI_MEET_REPO_URL}..."
        if [ -z "$(git ls-remote --heads ${JITSI_MEET_REPO_URL} ${JITSI_MEET_BRANCH})" ];
        then
            JITSI_MEET_BRANCH="master"
            echo "${JITSI_MEET_BRANCH} does not exist in ${JITSI_MEET_REPO_URL} - falling back to 'master'."
        fi
    fi
fi

echo "Selected jitsi-meet repo/branch to be merged: ${JITSI_MEET_REPO_URL} ${JITSI_MEET_BRANCH}"

# Setup env variables for the jitsi-meet script
TRAVIS_BRANCH=master
TRAVIS_REPO_SLUG=${TRAVIS_REPO_SLUG/lib-jitsi-meet/jitsi-meet}
PR_BRANCH=$JITSI_MEET_BRANCH
PR_REPO_SLUG=$JITSI_MEET_REPO_SLUG

# Checkout jitsi-meet master from the original repo

cd ..
git clone --depth=50 --branch=$TRAVIS_BRANCH https://github.com/${TRAVIS_REPO_SLUG}.git jitsi-meet
cd jitsi-meet

echo "Executing build-ipa script in jitsi-meet..."

LIB_JITSI_MEET_PKG="file:..\/lib-jitsi-meet"

. ./ios/travis-ci/build-ipa.sh

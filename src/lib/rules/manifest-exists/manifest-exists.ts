/**
 * @fileoverview Check if a single web app manifest file is specified,
 * and if that specified file is accessible.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { debug as d } from '../../utils/debug';
import { IElementFoundEvent, IManifestFetchEnd, IManifestFetchErrorEvent, ITraverseEndEvent, IRule, IRuleBuilder } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        let manifestIsSpecified = false;

        const manifestMissing = async (event: ITraverseEndEvent) => {
            if (!manifestIsSpecified) {
                await context.report(event.resource, null, 'Web app manifest not specified');
            }
        };

        const manifestExists = async (data: IElementFoundEvent) => {
            const { element, resource } = data;

            if (element.getAttribute('rel') !== 'manifest') {

                return;
            }

            // Check if we encounter more than one
            // <link rel="manifest"...> declaration.

            if (manifestIsSpecified) {
                await context.report(resource, element, 'Web app manifest already specified');

                return;
            }

            manifestIsSpecified = true;

            if (!element.getAttribute('href')) {
                // `collector`s will ignore invalid `href` and will not even initiate the request so we have to check for those.
                //TODO: find the relative location in the element
                await context.report(data.resource, data.element, `Web app manifest specified with invalid 'href'`);
            }
        };

        const manifestEnd = async (event: IManifestFetchEnd) => {
            // TODO: check why CDP sends sometimes status 301
            if (event.response.statusCode >= 400) {
                await context.report(event.resource, null, `Web app manifest file could not be fetched (status code: ${event.response.statusCode})`);
            }
        };

        const manifestError = async (event: IManifestFetchErrorEvent) => {
            debug('Failed to fetch the web app manifest file');
            await context.report(event.resource, null, `Web app manifest file request failed`);

            return;
        };

        return {
            'element::link': manifestExists,
            'manifestfetch::end': manifestEnd,
            'manifestfetch::error': manifestError,
            'traverse::end': manifestMissing
        };
    },
    meta: {
        docs: {
            category: 'pwa',
            description: 'Provide a web app manifest file',
            recommended: true
        },
        fixable: 'code',
        recommended: true,
        schema: [],
        worksWithLocalFiles: true
    }
};

export default rule;

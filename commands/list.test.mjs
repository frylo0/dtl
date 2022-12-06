import process from 'process';
import { jest } from '@jest/globals';
import { mockTemplateFolder } from '../test/lib.mjs';

mockTemplateFolder('./list/templates');

const { default: runList } = await import('./list.mjs');


describe('"List" command', () => { 
    let stdout;

    beforeEach(() => {
        jest.spyOn(process, 'exit').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation((...messages) => {
            stdout.push(messages.join(' '));                
        });

        stdout = [];
    });

    test('should show list of templates', async () => {
        runList();

        expect(stdout).toEqual([
            '', 
            '- Template1', 
            '- Template2', 
            '- Template3'
        ]);
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    })
});
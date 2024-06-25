import { test, expect } from '@playwright/test';

const baseURL = 'https://bcparks.ca/';


test.beforeEach(async ({page})=>{
    await page.goto(baseURL);
})

test('Check that the page has connected', async ({page}) =>{
    await expect(page).toHaveTitle('Home | BC Parks');
    await expect(page).toHaveURL(baseURL);
});

test('Verify the headers are visible on the home page', async ({page}) =>{
    await expect(page.getByRole('heading', { name: 'Advisories' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'New to BC Parks?' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'About BC Parks'})).toBeVisible();
});

test('Verify the Find a Park search box is present', async ({page}) =>{
    await expect(page.getByText('Find a parkBy park nameorNear')).toBeVisible();
    await expect(page.locator('h1', {name: 'Find a park'})).toBeVisible();
    await expect(page.getByLabel('By park name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search'})).toBeVisible();
});

test('Check that the suggestion dropdown menu for park name is visible', async ({page}) =>{
    await page.getByLabel('By park name').click();
    await expect(page.getByLabel('menu-options')).toBeVisible();
    await page.getByLabel('By park name').fill('G');
    await expect(page.getByLabel('Garibaldi Park')).toBeVisible();
    await page.getByLabel('By park name').fill('Gar');
    await expect(page.getByLabel('Garibaldi Park')).toBeVisible();
    await page.getByLabel('Garibaldi Park').click();
    await expect(page).toHaveURL(baseURL + 'find-a-park/?q=Garibaldi Park');
});

test('Check that the suggestion dropdown menu for city is visible', async ({page}) =>{
    await page.getByLabel('Near a city').click();
    await expect(page.getByLabel('menu-options')).toBeVisible();
    await expect(page.getByRole('option', { name: 'Current location' })).toBeVisible();
    await page.getByLabel('Near a city').fill('B');
    await expect(page.getByRole('option', { name: 'Burnaby'})).toBeVisible();
    await page.getByLabel('Near a city').fill('Bur');
    await page.getByRole('option', { name: 'Burnaby'}).click();
    await expect(page).toHaveURL(baseURL + 'find-a-park/?l=268');
});

test('Search for a park via a valid park name from home page', async ({page}) =>{
    await page.getByLabel('By park name').fill('Garibaldi');
    await page.getByRole('button', {name: 'Search'}).click();
    await expect(page).toHaveURL(baseURL + 'find-a-park/?q=Garibaldi');
    await expect(page).toHaveTitle('Find a park | BC Parks');
});

test('Search for a park via suggestion from home page', async ({page})=>{
    await page.getByLabel('By park name').fill('Garibaldi');
    await expect(page.getByLabel('Garibaldi Park')).toBeVisible();
    await page.getByLabel('Garibaldi Park').click();
    await expect(page).toHaveURL(baseURL + 'find-a-park/?q=Garibaldi%20Park');
});


test('Search for a park via city from home page', async ({page}) =>{
    await page.getByLabel('Near a city').fill('Vancouver');
    await page.getByRole('button', {name: 'Search'}).click();
    await expect(page).toHaveURL(baseURL + 'find-a-park/?l=1929');
    await expect(page).toHaveTitle('Find a park | BC Parks');
});


test('Search for a park with no search terms', async ({page})=>{
    await page.getByRole('button', { name: 'Search'}).click();
    await expect(page).toHaveURL(baseURL + 'find-a-park/');
});


test('Check that the redirect advisory links are working', async ({page})=>{
    await page.getByRole('link', { name: 'See flood advisories'}).click();
    await expect(page).toHaveURL(baseURL + 'active-advisories/?type=Flood');
    await expect(page).toHaveTitle('Active advisories | BC Parks');
    await page.goBack();
    await page.getByRole('link', { name: 'See wildfire advisories'}).click();
    await expect(page).toHaveURL(baseURL + 'active-advisories/?type=Wildfire');
    await expect(page).toHaveTitle('Active advisories | BC Parks');
    await page.goBack();
    await page.getByRole('link', { name: 'See all advisories'}).click();
    await expect(page).toHaveURL(baseURL + 'active-advisories/');
    await expect(page).toHaveTitle('Active advisories | BC Parks');
});

test('Check that the redirect New to BC Parks links are working', async ({page})=>{
    await page.getByAltText('Campers sitting near a tent').click();
    await expect(page).toHaveURL(baseURL + 'reservations/');
    await expect(page).toHaveTitle('Reservations - Province of British Columbia | BC Parks');
    await page.goBack();
    await page.getByAltText('People taking a photo outdoors').click();
    await expect(page).toHaveURL(baseURL + 'plan-your-trip/things-to-do/');
    await expect(page).toHaveTitle('Things to do - Province of British Columbia | BC Parks');
    await page.goBack();
    await page.getByAltText('A child in a wheelchair on a trail').click();
    await expect(page).toHaveURL('https://accessibility.bcparks.ca/');
    await expect(page).toHaveTitle('Park Accessibility Information – BC Parks');
    await page.goBack();
    await page.getByAltText('Cleaning up after a dog').click();
    await expect(page).toHaveURL(baseURL + 'plan-your-trip/visit-responsibly/');
    await expect(page).toHaveTitle('Visit responsibly - Province of British Columbia | BC Parks');
});

test('Check that the redirect About BC Parks links are working', async ({page})=>{
    await page.getByRole('link', { name: 'An indigenous carving' }).click();
    await expect(page).toHaveURL(baseURL + 'about/indigenous-relations-reconciliation/');
    await expect(page).toHaveTitle('Indigenous relations and reconciliation  - Province of British Columbia | BC Parks');
    await page.goBack();
    await page.getByRole('link', { name: 'A Bighorn Sheep Wildlife'}).click();
    await expect(page).toHaveURL(baseURL + 'plan-your-trip/visit-responsibly/wildlife-safety/');
    await expect(page).toHaveTitle('Wildlife safety - Province of British Columbia | BC Parks');
    await page.goBack();
    await page.getByRole('link', { name: 'A mountain peak Conservation' }).click();
    await expect(page).toHaveURL(baseURL + 'conservation/');
    await expect(page).toHaveTitle('Conservation - Province of British Columbia | BC Parks');
    await page.goBack();
    await page.getByRole('link', { name: 'People holding license plates' }).click();
    await expect(page).toHaveURL(baseURL + 'get-involved/');
    await expect(page).toHaveTitle('Get involved - Province of British Columbia | BC Parks');
});
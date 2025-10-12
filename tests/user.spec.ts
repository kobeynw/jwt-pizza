import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = {
    'd@jwt.com': {
      id: '3',
      name: 'Kai Chen',
      email: 'd@jwt.com',
      password: 'a',
      roles: [{ role: Role.Diner }],
    },
  };

  // Authentication Routes
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'POST') {
      // Register
      const registerReq = route.request().postDataJSON();
      loggedInUser = validUsers[registerReq.email];
      const registerRes = {
        user: loggedInUser,
        token: 'abcdef',
      };
      await route.fulfill({ json: registerRes });
    } else if (route.request().method() === 'PUT') {
      // Login
      const loginReq = route.request().postDataJSON();
      const user = validUsers[loginReq.email];
      if (!user || user.password !== loginReq.password) {
        await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
        return;
      }
      loggedInUser = validUsers[loginReq.email];
      const loginRes = {
        user: loggedInUser,
        token: 'abcdef',
      };
      await route.fulfill({ json: loginRes });
    } else if (route.request().method() === 'DELETE') {
      // Logout
      const logoutRes = {
        message: 'logout successful',
      };
      await route.fulfill({ json: logoutRes });
    }
  });

  // User Routes
  await page.route('*/**/api/user/me', async (route) => {
    // Get authenticated user
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  await page.route(/\/api\/user\/(\d+)?$/, async (route) => {
    if (route.request().method() === 'PUT') {
      // Update authenticated user
      const updateReq = route.request().postDataJSON();
      const updateRes = {
        user: {
          id: 1,
          name: updateReq.name,
          email: updateReq.email,
          roles: [
            {
              role: Role.Diner
            }
          ]
        },
        token: "abcdef"
      }

      validUsers[updateReq.email]["name"] = updateReq.name;

      await route.fulfill({ json: updateRes });
    }
  });

  await page.goto('/');
}

test('updateUser', async ({ page }) => {await basicInit(page);
  // Register
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('Kai Chen');
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Register' }).click();

  // Diner dashboard
  await page.getByRole('link', { name: 'KC' }).click();

  await expect(page.getByRole('main')).toContainText('Kai Chen');

  // Edit modal
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill('Johnny Test');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('Johnny Test');

  // Logout
  await page.getByRole('link', { name: 'Logout' }).click();

  // Login
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Diner dashboard
  await page.getByRole('link', { name: 'JT' }).click();

  await expect(page.getByRole('main')).toContainText('Johnny Test');
});
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
    'f@jwt.com': {
      id: '5',
      name: 'Frank',
      email: 'f@jwt.com',
      password: 'c',
      roles: [{ role: Role.Franchisee }],
    },
    'a@jwt.com': {
      id: '7',
      name: 'Johnny Test',
      email: 'a@jwt.com',
      password: 'b',
      roles: [{ role: Role.Admin }],
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

  // Menu Routes
  await page.route('*/**/api/order/menu', async (route) => {
    if (route.request().method() === 'GET') {
      // Get the pizza menu
      const menuRes = [
        {
          id: 1,
          title: 'Veggie',
          image: 'pizza1.png',
          price: 0.0038,
          description: 'A garden of delight',
        },
        {
          id: 2,
          title: 'Pepperoni',
          image: 'pizza2.png',
          price: 0.0042,
          description: 'Spicy treat',
        },
      ];
      await route.fulfill({ json: menuRes });
    }
  });

  // Order Routes
  await page.route('*/**/api/order', async (route) => {
    if (route.request().method() === 'POST') {
      // Create an order for the user
      const orderReq = route.request().postDataJSON();
      const orderRes = {
        order: { ...orderReq, id: 23 },
        jwt: 'eyJpYXQ',
      };
      await route.fulfill({ json: orderRes });
    } else if (route.request().method() === 'GET') {
      // Get the orders for the user
      const orderRes = {
        dinerId: 4,
        orders: [
          {
            id: 1,
            franchiseId: 1,
            storeId: 1,
            date: "2025-06-05T05:14:40.000Z",
            items: [
              {
                id: 1,
                menuId: 1,
                description: "Veggie",
                price: 0.05,
              },
            ],
          },
        ],
        page: 1,
      };
      await route.fulfill({ json: orderRes });
    }
  });

  // Store Routes
  await page.route(/\/api\/\d+\/store\/(\d+)?$/, async (route) => {
    if (route.request().method() === 'POST') {
      // Create new franchise store
      const storeReq = route.request().postDataJSON();
      const storeRes = {
        id: 1,
        name: storeReq.name,
        totalRevenue: 0,
      };
      await route.fulfill({ json: storeRes });
    } else if (route.request().method() === 'DELETE') {
      // Delete franchise store
      const franchiseRes = {
        message: "store deleted",
      };
      await route.fulfill({ json: franchiseRes });
    }
  });

  // Franchise Routes
  await page.route(/\/api\/franchise\?.*$/, async (route) => {
    if (route.request().method() === 'GET') {
      // List all the franchises
      const franchiseRes = {
        franchises: [
          {
            id: 2,
            name: 'LotaPizza',
            stores: [
              { id: 4, name: 'Lehi' },
              { id: 5, name: 'Springville' },
              { id: 6, name: 'American Fork' },
            ],
          },
          { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
          { id: 4, name: 'topSpot', stores: [] },
        ],
      };
      await route.fulfill({ json: franchiseRes });
    } else if (route.request().method() === 'POST') {
      // Create new franchise
      const franchiseReq = route.request().postDataJSON();
      const franchiseRes = {
        name: franchiseReq.name,
        admins: [{
          email: franchiseReq.admins.email,
          id: 4,
          name: "pizza franchisee",
        }],
        id: 1,
      };
      await route.fulfill({ json: franchiseRes });
    }
  });

  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
    if (route.request().method() === 'GET') {
      // Get user's franchises
      const franchiseRes = [{
        id: "2",
        name: 'LotaPizza',
        admins: [{ id: "5", name: "Frank", email: "f@jwt.com", }],
        stores: [{ id: "7", name: 'Spanish Fork', totalRevenue: 0, }],
      }];
      await route.fulfill({ json: franchiseRes });
    } else if (route.request().method() === 'DELETE') {
      // Delete user's franchises
      const franchiseRes = {
        message: "franchise deleted",
      };
      await route.fulfill({ json: franchiseRes });
    }
  });

  await page.goto('/');
}

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  await expect(page).toHaveTitle('JWT Pizza');
});

test('footer pages', async ({ page }) => {
  await basicInit(page);

  // Go to About page
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page.getByRole('main')).toContainText('The secret sauce');

  // Go to History page
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');

  // Go to Franchise page
  await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByRole('main')).toContainText('So you want a piece of the pie?');
});

test('login', async ({ page }) => {
  await basicInit(page);

  // Login
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('register and logout', async ({ page }) => {
  await basicInit(page);

  // Register
  await page.getByRole('link', { name: 'Register' }).click();
  await expect(page.getByRole('heading')).toContainText('Welcome to the party');
  await page.getByRole('textbox', { name: 'Full name' }).fill('Johnny Test');
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('b');
  await page.getByRole('button', { name: 'Register' }).click();

  // Logout
  await expect(page.getByRole('heading')).toContainText("The web's best pizza");
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});

test('', async ({ page }) => {
  
});

test('purchase with login', async ({ page }) => {
  await basicInit(page);

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});

test('diner dashboard', async ({ page }) => {
  await basicInit(page);

  // Login
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').fill('a@jwt.com');
  await page.getByPlaceholder('Password').fill('b');
  await page.getByRole('button', { name: 'Login' }).click();

  // Diner dashboard
  await page.getByRole('link', { name: 'JT' }).click();
  await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');
  await expect(page.getByRole('main')).toContainText('Johnny Test');
  await expect(page.getByRole('main')).toContainText('a@jwt.com');
  await expect(page.getByRole('main')).toContainText('admin');
  await expect(page.locator('tbody')).toContainText('4');
  await expect(page.locator('tbody')).toContainText('0.05 ₿');
  await expect(page.locator('tbody')).toContainText('2025-06-05T05:14:40.000Z');
});

test('franchise dashboard', async ({ page }) => {
  await basicInit(page);

  // Login
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').fill('f@jwt.com');
  await page.getByPlaceholder('Password').fill('c');
  await page.getByRole('button', { name: 'Login' }).click();

  // Franchisee dashboard
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();

  // Add store
  await page.getByRole('button', { name: 'Create store' }).click();
  await expect(page.getByRole('heading')).toContainText('Create store');
  await page.getByRole('textbox', { name: 'store name' }).fill('dummy');
  await page.getByRole('button', { name: 'Create' }).click();
});

test('admin dashboard', async ({ page }) => {
  await basicInit(page);

  // Login
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').fill('a@jwt.com');
  await page.getByPlaceholder('Password').fill('b');
  await page.getByRole('button', { name: 'Login' }).click();

  // Admin dashboard
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.locator('h2')).toContainText('Mama Ricci\'s kitchen');
  await expect(page.getByRole('table').nth(0)).toContainText('LotaPizza');

  // Filter franchises
  await page.getByRole('textbox', { name: 'Filter franchises' }).click();
  await page.getByRole('textbox', { name: 'Filter franchises' }).fill('Lot');
  await page.getByRole('button', { name: 'Submit' }).nth(0).click();
  await expect(page.getByRole('table').nth(0)).toContainText('LotaPizza');
  
  // Add franchise
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await expect(page.getByRole('heading')).toContainText('Create franchise');
  await page.getByRole('textbox', { name: 'franchise name' }).fill('pizzaPocket');
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('f@jwt.com');
  await page.getByRole('button', { name: 'Create' }).click();
  await page.getByRole('link', { name: 'admin-dashboard' }).click();

  await page.getByRole('row', { name: /.*Spanish Fork.*Close.*/ }).getByRole('button').click();
  await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
});

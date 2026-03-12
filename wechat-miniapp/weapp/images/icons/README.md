# Icons Inventory

All active mini-program icons are stored under this directory.

## Structure

- `tabbar/` Tab bar icons used in `app.json`
- `common/` Shared icons used across pages
- `iconify/` Icons downloaded from Iconify and used by `pages/userInfo/myInfo.wxml`

## Active Icons

- `tabbar/home.png` -> `pages/index/index`
- `tabbar/home-active.png` -> selected `pages/index/index`
- `tabbar/search.png` -> `pages/index/search/search`
- `tabbar/search-active.png` -> selected `pages/index/search/search`
- `tabbar/apply.png` -> `pages/apply/apply`
- `tabbar/apply-active.png` -> selected `pages/apply/apply`
- `tabbar/my.png` -> `pages/userInfo/myInfo`
- `tabbar/my-active.png` -> selected `pages/userInfo/myInfo`
- `common/location.png` -> `pages/index/bikeInfo/bikeInfo.wxml`
- `common/gender-male.png` -> `pages/userInfo/myInfo.wxml`
- `common/gender-female.png` -> `pages/userInfo/myInfo.wxml`

## Iconify Mapping (for future replacements)

To keep a consistent source standard, these can be replaced with Iconify exports:

- home: `mdi:home-outline` / active `mdi:home`
- search: `mdi:magnify` / active `mdi:magnify`
- apply: `mdi:file-document-outline` / active `mdi:file-document`
- my: `mdi:account-outline` / active `mdi:account`
- location: `mdi:map-marker-outline`
- gender male/female: `mdi:gender-male`, `mdi:gender-female`

## Downloaded Iconify Assets

- `iconify/order.svg` <- `mdi:file-document-outline`
- `iconify/collection.svg` <- `mdi:heart-outline`
- `iconify/visited.svg` <- `mdi:history`
- `iconify/message.svg` <- `mdi:message-outline`
- `iconify/profile.svg` <- `mdi:account-circle-outline`
- `iconify/rent.svg` <- `mdi:car-outline`
- `iconify/setting.svg` <- `mdi:cog-outline`
- `iconify/help.svg` <- `mdi:help-circle-outline`

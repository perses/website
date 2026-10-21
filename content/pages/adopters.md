# Adopters

Whether you are contributing to the project or using it, we would love to hear from you.

Requirements for the company:

* It is contributing to the project, or it is using Perses
* It is a legal registered company
* It is happy to announce that it is using Perses publicly

If these requirements are met, open a pull request in the repository [perses/website](https://github.com/perses/website)
that:

1. adds the logo of your company in the folder `public/assets/images/logos/`:
    * The logo should be in SVG or PNG format, and the name of the file should be the name of the company in
      CamelCase, with no space or special character.
    * If your company has a logo for the dark and the light themes, add both. To differentiate them, add
      `_dark_theme` or `_light_theme` to the name of the file.

    For example, `Mycompany.svg` or `Mycompany_dark_theme.svg` and `Mycompany_light_theme.svg`.

2. adds your company to the file `content/adopters.yaml`, sorted alphabetically:

    ```yaml
    - name: My Company
      url: https://mycompany.com
      logo:
        light: /assets/images/logos/Mycompany_light_theme.svg
        dark: /assets/images/logos/Mycompany_dark_theme.svg # optional
    ```

// common constants, shared between multiple pieces of code (and likely client and server)

export const EMAIL_PATTERN = /^[^@]+@[^@]+$/
export const EMAIL_MINLENGTH = 3
export const EMAIL_MAXLENGTH = 100

export const LOBBY_NAME_MAXLENGTH = 50

export const PASSWORD_MINLENGTH = 6

export const PORT_MIN_NUMBER = 0
export const PORT_MAX_NUMBER = 65535

export const USERNAME_PATTERN = /^[A-Za-z0-9`~!$^&*()[\]\-_+=.{}]+$/
export const USERNAME_MINLENGTH = 1
export const USERNAME_MAXLENGTH = 16

export function isValidUsername(username) {
  return username &&
    username.length >= USERNAME_MINLENGTH &&
    username.length <= USERNAME_MAXLENGTH &&
    USERNAME_PATTERN.test(username)
}

export function isValidEmail(email) {
  return email &&
    email.length >= EMAIL_MINLENGTH &&
    email.length <= EMAIL_MAXLENGTH &&
    EMAIL_PATTERN.test(email)
}

export function isValidPassword(password) {
  return password &&
      password.length >= PASSWORD_MINLENGTH
}

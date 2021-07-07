import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import i18n from 'configs/i18n'
import { API_URL } from 'constants/general'
import { ERROR_TYPE } from 'interfaces/ErrorTypes'
import { mapKeys, snakeCase } from 'lodash'
import { logoutAction } from 'redux/actions/auth/authAction'
import { store } from 'redux/store'
import { checkError } from 'utils/Functions'

const DEFAULT_API_CONFIG: AxiosRequestConfig = {
  baseURL: API_URL,
  timeout: 30000
}

const instance = axios.create({
  ...DEFAULT_API_CONFIG
})

instance.interceptors.request.use((config: any) => {
  config.data = mapKeys(config.data, (_, key) => snakeCase(key))
  return config
})

instance.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    if (
      error.response?.data?.errorType === ERROR_TYPE.ACCESS_TOKEN_EXPIRED ||
      error.response?.data?.errorType === ERROR_TYPE.UNAUTHORIZED
    )
      return logout()
    if (error.response) {
      throw error.response
    }
    if (error.message && error.message === 'Network Error') {
      throw Object.assign(
        checkError(
          ERROR_TYPE.ERR_INTERNET_DISCONNECTED,
          i18n.t('errors.internet')
        )
      )
    }
    if (error.request) {
      throw Object.assign(
        checkError(ERROR_TYPE.BAD_REQUEST, i18n.t('errors.badRequest'))
      )
    }
    throw error?.message || i18n.t('errors.wrong')
  }
)

const logout = () => {
  // handle logout
  store.dispatch(logoutAction())
  localStorage.removeItem('persist:root')
  window.location.replace('/')
}

export default instance

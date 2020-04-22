import request from '@/utils/request'

export function cameraList(params) {
  return request({
    url: '/tainbo/camera/cameraList',
    method: 'get',
    params
  })
}


export function dupCameraName(params) {
  return request({
    url: '/tainbo/camera/dupCameraName',
    method: 'get',
    params
  })
}

export function newCamera(data) {
  return request({
    url: '/tainbo/camera/newCamera',
    method: 'post',
    data,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
  })
}

export function updateCamera(data) {
  return  request({
    url: '/tainbo/camera/updateCamera',
    method: 'post',
    data,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
  })
}

export function deleteCamera(params) {
  return  request({
    url: '/tainbo/camera/deleteCamera',
    method: 'delete',
    params
  })
}

export function videoUrl(data) {
    return request({
      url: '/tainbo/camera/videoUrl',
      method: 'post',
      data,
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      }
    })
  }
  
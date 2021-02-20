import Api from './api'

export default {
  
  hasUserEndorsedTitle(params) {
    return Api().get('/custom-title-endorsement/user/' + params.setId,
    {
      withCredentials: true
    })
  },
  setEndorsementStatus(params, reqBody) {
    return Api().post('/custom-title-endorsement/' + params.setId,
    reqBody, {
      withCredentials: true
    })
  },
  getTitleEndorsers(params, headers) {
    return Api().get('/custom-title-endorsement/' + params.setId,
    {
      withCredentials: true,
      headers: headers
    })
  },

  getTitleHashMatches(reqBody) {
    return Api().post('/custom-titles-match',
    reqBody, {
      withCredentials: true
    })
  },
  /*
  req.body includes: postId, postUrl, customTitleText, pageIndentifiedTitle
  */
  postCustomTitle(reqBody) {
    return Api().post('/custom-titles/',
      reqBody, {
        withCredentials: true
      })
  },
  editCustomTitle(params, reqBody) {
    console.log(params, reqBody)
    return Api().post('/posts/' + params.postId + '/custom-titles/' + params.setId,
      reqBody, {
        withCredentials: true
      })
  },
  deleteCustomTitle(params) {
    return Api().delete('/posts/' + params.postId + '/custom-titles/' + params.setId,
    { withCredentials: true })
  },
  getCustomTitlesOfPost(params, headers) {
    return Api().get('/posts/' + params.postId + '/custom-titles',
    {
      withCredentials: true,
      headers: headers
    })
  },
}

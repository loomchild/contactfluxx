/* global $:false, fetch:false */
/* eslint-env browser */

var userProjects, selectedProject, selectedSource, selectedTarget, selectedError, selectedSourceCompany, selectedTargetCompany, selectedErrorCompany

function isLoggedIn () {
  return request('/user')
    .then((status) => status.success)
}

function request (url, options) {
  return fetch(url, Object.assign({}, options, {credentials: 'same-origin', headers: {'content-type': 'application/json'}}))
    .then(res => res.json())
    .catch(err => alert(err))
}

function getProjects () {
  return request('/api/projects').then(function (projects) {
    userProjects = projects
    return userProjects
  })
}

function showLogin () {
  $('#login').show().click(() => window.location.replace('/login'))
  $('#container').hide()
}

function fetchProjects () {
  return getProjects().then(function (data) {
    $('.project .menu').empty() // anything with a class of menu is a child of a class of project.
    for (var p of userProjects) {
      $('.project .menu').append('<div class="item" data-value="' + p.id + '">' + p.name + '</div>')
    }
    $('.project').dropdown('refresh')
    return data
  })
}

function fetchKeys () {
  return getKeys().then(function (data) {
    $('.keys .menu').empty()
    for (var k of data) {
      $('.keys .menu').append('<div class="item" data-value="' + k.label + '">' + k.label + '</div>')
    }
    $('.keys').dropdown('refresh')
    return data
  })
}

function getKeys () {
  return request('/api/keys?projectId=' + encodeURIComponent(selectedProject.id))
}

function init () {
  isLoggedIn()
    .then((status) => {
      if (status) {
        $('.ui.dropdown.project').dropdown({
          onChange: function (id) {
            selectedProject = userProjects.filter(function (p) { return p.id === id })[0]
            fetchKeys()
          }
        })

        $('.ui.dropdown.source-keys').dropdown({
          onChange: function (id) {
            selectedSource = id
          }
        })

        $('.ui.dropdown.target-keys').dropdown({
          onChange: function (id) {
            selectedTarget = id
          }
        })

        $('.ui.dropdown.error-keys').dropdown({
          onChange: function (id) {
            selectedError = id
          }
        })

        $('.ui.dropdown.source-company-keys').dropdown({
          onChange: function (id) {
            selectedSourceCompany = id
          }
        })

        $('.ui.dropdown.target-company-keys').dropdown({
          onChange: function (id) {
            selectedTargetCompany = id
          }
        })

        $('.ui.dropdown.error-company-keys').dropdown({
          onChange: function (id) {
            selectedErrorCompany = id
          }
        })

        $('.ui.button.save').click(() => {
          let data = {
            project: selectedProject.id,
            source: selectedSource,
            dest: selectedTarget,
            error: selectedError,
            sourceC: selectedSourceCompany,
            destC: selectedTargetCompany,
            errorC: selectedErrorCompany
          }
          let url = 'https://flux.io/p/' + selectedProject.id
          $('#success a').attr('href', url) // LIES!!
          request('/api/request', {body: JSON.stringify(data), method: 'POST'})
          $('#container').fadeOut(200)
          setTimeout(() => { $('#success').fadeIn(200) }, 200)
        })
        fetchProjects()
      } else showLogin()
    })
}

window.onload = init

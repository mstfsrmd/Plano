$(document).ready(function () {
  var socket = io();
  var loginUser = $('#in_user_logIn').val();
  var loginPass = $('#in_pass_logIn').val();
  const color =['#EEB1B1', '#E3EEB1', '#B1BDEE', '#ddd', '#B1EECA', '#EEDBB1'];
  var table = {};
  table['table'] = {};



  function sinceTime(date) {
    let date1 = date.split(' ')[0], time = date.split(' ')[1]
    let oy = date1.split('-')[0], om = date1.split('-')[1], od = date1.split('-')[2];
    let oh = time.split(':')[0], omin = time.split(':')[1], os = time.split(':')[2];
    let d = new Date(), ns = d.getSeconds(), nmin = d.getMinutes(), nh = d.getHours();
    let nd = d.getDate(), nm = d.getMonth()+ 1, ny = d.getFullYear();
    if (ns<10) ns = '0'+d.getSeconds();
    if (nmin<10) nmin = '0'+d.getMinutes();
    if (nh<10) nh = '0'+d.getHours();
    if (nd<10)  nd = '0'+d.getDate();
    if (nm<10)  nm = '0'+d.getMonth();
    if (oy == ny) {
      if (om == nm) {
        if (od == nd) {
          if (nh == oh) {
            if (nmin == omin) {
              if (ns-os<60) {
                cTime = cTime + 'لحظاتی پیش'
              }
            }else {
              cTime = nmin-omin;
              cTime = cTime + ' دقیقه پیش'
            }
          }else {
            cTime = nh-oh;
            cTime = cTime + ' ساعت پیش'
          }
        }else {
          cTime = nd-od;
          cTime = cTime + ' روز پیش'
        }
      }else {
        cTime = nm-om;
        cTime = cTime + ' ماه پیش'
      }
    }else {
      cTime = ny-oy;
      cTime = cTime + ' سال پیش'
    }
    return cTime;
  }

  setInterval(function () {
    $('time').each(function (i) {
      let date = $(this).attr('value');
      let pRe = $(this).html();
      let nEw = sinceTime(date)+' ';
      if (pRe != nEw) {
        $(this).html(nEw)
        console.log(sinceTime(date));
      }
    })
  }, 1000);

  //auto login
  if ( document.URL.includes("logIn.html") ) {
    if (localStorage.getItem("username")!='' && localStorage.getItem("password")!='') {
      loginUser = localStorage.getItem("username");
      loginPass = localStorage.getItem("password");
      socket.emit('verify', {loginUser, loginPass});
    }
  }
  $('.signUp').click(function () {
    location.href="signUp.html";
  });
  $('.logIn').click(function () {
    location.href="logIn.html";
  });
  $('.in').focus(function () {
    var id = $(this).attr("id");
    $("label[for='"+$(this).attr("id")+"']").css({'color':'#333'})
    $(this).css({'border':'solid #222 1px'})
    if (id == 'in_user_signUp' || id == 'in_user_logIn') {
      $('.main_input_atsign').css({'color':'#333'})
    }
  })
  $('.in').blur(function () {
    var id = $(this).attr("id");
    if ($(this).val() == '') {
      $("label[for='"+$(this).attr("id")+"']").css({'color':'#aaa'})
      $(this).css({'border':'solid #999 .3px'})
      if (id == 'in_user_signUp' || id == 'in_user_logIn') {
        $('.main_input_atsign').css({'color':'#aaa'})
      }
    }
  });

  var checkIfAllIsRight4user = false;
  var checkIfAllIsRight4email = false;
  //check if username exist
  $('#in_user_signUp').on('input', function () {
    var checkUsername = $(this).val();
    socket.emit('checkUsername', checkUsername);
    socket.on('isUsr', function (isUsr) {
      if (checkUsername != '') {
        if (isUsr) {
          if ($('#err_usr').length == 0) {
            $('.main_input_err').append("<div id='err_usr'>این نام کاربری قبلا انتخاب شده است</div>");
          }
          $('#signIn_submit').prop('disabled', true);
          $('#signIn_submit').css({'opacity': '.4', 'cursor': 'not-allowed'});
          checkIfAllIsRight4user = false;
        }else {
          $('#err_usr').remove();
          if ($('.main_input_err').is(':empty')) {
            $('#signIn_submit').prop('disabled', false);
            $('#signIn_submit').css({'opacity': '1', 'cursor': 'pointer'});
          }
          checkIfAllIsRight4user = true;
        }
      }else {
        $('#err_usr').remove();
        if ($('.main_input_err').is(':empty')) {
          $('#signIn_submit').prop('disabled', false);
          $('#signIn_submit').css({'opacity': '1', 'cursor': 'pointer'});
        }
        checkIfAllIsRight4user = false;
      }
    })
  });
  $('#in_email_signUp').on('input', function () {
    var checkEmail = $(this).val();
    socket.emit('checkEmail', checkEmail);
    socket.on('isEmail', function (isEmail) {
      if (checkEmail != '') {
        if (isEmail) {
          if ($('#err_email').length == 0) {
            $('.main_input_err').append("<div id='err_email'>این ایمیل قبلا انتخاب شده است</div>");
          }
          $('#signIn_submit').prop('disabled', true);
          $('#signIn_submit').css({'opacity': '.4', 'cursor': 'not-allowed'});
          checkIfAllIsRight4email = false;
        }else {
          $('#err_email').remove();
          if ($('.main_input_err').is(':empty')) {
            $('#signIn_submit').prop('disabled', false);
            $('#signIn_submit').css({'opacity': '1', 'cursor': 'pointer'});
          }
          checkIfAllIsRight4email = true;
        }
      }else {
        $('#err_email').remove();
        if ($('.main_input_err').is(':empty')) {
          $('#signIn_submit').prop('disabled', false);
          $('#signIn_submit').css({'opacity': '1', 'cursor': 'pointer'});
        }
        checkIfAllIsRight4email = false;
      }
    })
  });
  $('.main_input_form_signUp').submit(function (event) {
    var name = $('#in_name_signUp').val();
    var username = $('#in_user_signUp').val();
    var email = $('#in_email_signUp').val();
    var pass = $("#in_pass_signUp").val();
    //$('.storeusr').val(usrname);
    //$('.storepass').val(pass);
    //$('.storeemail').val(email);
    //storedUsername = $('.storeusr').val();
    //storedPass = $('.storepass').val();
    //storedEmail = $('.storeemail').val();
    event.preventDefault();
    console.log(username);
    if (checkIfAllIsRight4email && checkIfAllIsRight4user) {
      localStorage.setItem("username", username);
      localStorage.setItem("password", pass);
      location.href="logIn.html";
      socket.emit('usrinfo', {name, username, email, pass});
    }
  });



  //Login Handling
  $('.main_input_form_login').submit(function (event) {
    loginUser = $('#in_user_logIn').val();
    loginPass = $('#in_pass_logIn').val();
    socket.emit('verify', {loginUser, loginPass});
    event.preventDefault();
  })
  //load main page
  socket.on('verifyRes',function (v) {
    if (!v.username) {
      $('#main_input_err').html('نام کاربری یا رمز عبور نادرست است')
    }else {
      $('#main_input_err').html('');
      localStorage.setItem("username", loginUser);
      localStorage.setItem("password", loginPass);
      $('.loginBlock').remove();
      let c ='';
      if (v.cert) {
        c = '<div class="verified" dir="rtl">تایید شده</div>'
      }
      $('.primary').append(`
        <div class="main_main dis_flex_dir_col_jsf_cntr_itmalign_cntr pos_abs_cntr">
          <nav class="main_nav dis_flex_dir_row_jsf_cntr_itmalign_cntr">
            <div class="main_nav_profile dis_flex_dir_row_jsf_cntr_itmalign_cntr">
              <div class="main_nav_profilePic">
                <img src="${v.proPic}" alt="">
              </div>
              <div class="main_nav_profileTitle dis_flex_dir_col_jsf_cntr_itmalign_cntr">
                <h2 dir="rtl">${v.name}</h5>
                <p dir="ltr">@${v.username}</p>
                <div class="main_nav_profileOptions dis_flex_dir_row_jsf_cntr_itmalign_cntr">
                  <div class="main_nav_profile_new">
                    <i class="material-icons main_nav_profile_icon ">&#xe145;</i>
                  </div>
                  <div class="main_nav_profile_setting">
                    <i class="material-icons main_nav_profile_icon">&#xe8b8;</i>
                  </div>
                  <div class="main_nav_profile_notif">
                    <i class="material-icons main_nav_profile_icon">&#xe7f4;</i>
                    <i class="fa main_nav_profile_icon_alarm">&#xf111;</i>
                  </div>
                  <div class="blackArea_1"></div>
                </div>
                <div class="window_container">
                  <div class="setting_popUp_window" id="new_popUp">
                    <div class="setting_popUp_window_trngl"></div>
                    <div class="setting_popUp_window_content">
                      <div class="newPlan setting_popUp_window_content_newPln dis_flex_dir_row_jsf_cntr_itmalign_cntr">
                        <i class="material-icons setting_popUp_window_icon">&#xe146;</i>
                        <p dir="rtl">ایجاد برنامه جدید</p>
                      </div>
                      <div class="setting_popUp_window_content_newPln dis_flex_dir_row_jsf_cntr_itmalign_cntr">
                        <span class="material-icons  setting_popUp_window_icon">calendar_today</span>
                        <p dir="rtl">ثبت رویداد جدید</p>
                      </div>
                    </div>
                  </div>
                  <div style="right:40px;" class="setting_popUp_window" id="setting_popUp">
                    <div class="setting_popUp_window_trngl"></div>
                    <div class="setting_popUp_window_content">
                      <div class="newPlan setting_popUp_window_content_newPln dis_flex_dir_row_jsf_cntr_itmalign_cntr">
                        <span class="material-icons  setting_popUp_window_icon">account_circle</span>
                        <p dir="rtl">تغییر تصویر پروفایل</p>
                      </div>
                      <div class="setting_popUp_window_content_newPln dis_flex_dir_row_jsf_cntr_itmalign_cntr">
                        <span class="material-icons setting_popUp_window_icon">vpn_key</span>
                        <p dir="rtl">تغییر رمزعبور</p>
                      </div>
                      <div class="setting_popUp_window_content_newPln dis_flex_dir_row_jsf_cntr_itmalign_cntr" id="setting_popUp_window_content_exit">
                        <i class="material-icons setting_popUp_window_icon">&#xe8ac;</i>
                        <p dir="rtl">خروج</p>
                      </div>
                      <div class="setting_popUp_window_content_newPln dis_flex_dir_row_jsf_cntr_itmalign_cntr">
                        <span class="material-icons setting_popUp_window_icon">more_horiz</span>
                        <p dir="rtl">بیشتر</p>
                      </div>
                    </div>
                  </div>
                  <div style="right:70px;" class="setting_popUp_window"  id="notif_popUp">
                    <div class="setting_popUp_window_trngl"></div>
                    <div class="setting_popUp_window_content">
                      <div class="newPlan setting_popUp_window_content_newPln dis_flex_dir_row_jsf_cntr_itmalign_cntr">
                        <div class="notif_content">
                          <h3 dir="rtl">تایید ایمیل</h3>
                          <p style="color: #aaa" dir="rtl">ما برای بازیابی اطلاعات شخصی شما به یک ایمیل تایید شده نیاز داریم.اگر ایمیل خود را ...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ${c}
            <div class="main_nav_srch dis_flex_dir_row_jsf_cntr_itmalign_cntr">
              <span class="explore_icon"><i class="material-icons main_nav_srch_icon pos_abs_cntr">&#xe87a;</i></span>
              <input class="main_nav_search" dir="rtl" type="search" placeholder="کاوش در تمام پلنو">
              <div class="blackAreaSearch"></div>
              <div class="search_resault dis_flex_dir_col_jsf_cntr_itmalign_cntr">
                <div class="search_resault_noSrch dis_flex_dir_col_jsf_cntr_itmalign_cntr">
                  <p>ᕙ(◉◞ ◉)ᕗ</p>
                </div>
              </div>
            </div>
          </nav>
          <section class="main_section dis_flex_dir_row_jsf_cntr_itmalign_cntr">
            <div class="main_section_main"></div>
            <div class="main_section_ctrl">
              <div class="newPlan main_section_newPlan pos_abs_cntr">
                <div class="newPlan_icon pos_abs_cntr">
                  <i style="font-size:34px" class="fa">&#xf067;</i>
                </div>
              </div>
            </div>
          </section>
        </div>`);
      if (localStorage.getItem("alarm") == 'none') {
        $('.main_nav_profile_icon_alarm').css('display','none');
      }
    }
  });

  //getting tables
  socket.on('loadPlans', function (t) {
    if (t != '') {
      if ($('myPlan_cont').length == 0) {
        $('.main_section_main').append('<div class="myPlan_cont dis_flex_dir_row_jsf_cntr_itmalign_cntr"></div>')
      }
      for (var i = 0; i < t.length; i++) {
        let title = t[i].title, category = t[i].category, description = t[i].description, condition = t[i].condition;
        let likeNum = Object.keys(t[i].likes).length, replyNum = Object.keys(t[i].replies).length;
        let watcheNum = Object.keys(t[i].watchs).length, useNum = Object.keys(t[i].uses).length;
        let date = t[i].dateTime, author = t[i].author; let iconMain, icon_2, icon_3, statusMain, status_2, status_3;
        let planId = t[i].planId; var cTime;
        let createdDate = sinceTime(date);
        let likeHtml = 'favorite_border', likeControler = 'false';
        if (category == '') {
          category = 'پیش فرض';
        }
        console.log(t[i].likes);
        for (var j = 0; j < Object.keys(t[i].likes).length; j++) {
          if (t[i].likes[j] == loginUser) {
            likeHtml = 'favorite';
            likeControler = 'true';
          }
        }
        if (condition == 'pblc') {iconMain = 'public';icon_2 = 'work';icon_3 = 'lock'; statusMain = 'عمومی'; status_2 = 'خصوصی'; status_3 = 'شخصی';}
        else if (condition == 'prsnl') {iconMain = 'work';icon_2 = 'public';icon_3 = 'lock'; statusMain = 'خصوصی'; status_2 = 'عمومی'; status_3 = 'شخصی';}
        else if (condition == 'prvt') {iconMain = 'lock';icon_2 = 'public';icon_3 = 'work'; statusMain = 'شخصی'; status_2 = 'عمومی'; status_3 = 'خصوصی';}
        $('.myPlan_cont').prepend(`
          <div class="myPlan dis_flex_dir_col_jsf_cntr_itmalign_cntr myPlan_prsnl" id="${planId}" name="${title}">
            <div class="myPlan_body">
              <div class="myPlan_body_hed dis_flex_dir_row_jsf_cntr_itmalign_cntr myPlan_prsnl">
                <div class="myPlan_body_title">
                  <h5>${category}/</h5>
                  <h1><strong>${title}</strong></h1>
                  <p>${description}</p>
                </div>
                <div class="myPlan_body_status" id="myPlan_info_icon_cont_status_${planId}" for="${planId}" primary="${condition}" isOpen="false">
                  <div class="" thisStatus="${iconMain}" isPrimary="true">
                    <div status="${condition}" style="background:none" class="myPlan_info_icon_cont_status dis_flex_dir_row_jsf_cntr_itmalign_cntr" forPID="${planId}" thisStatus="${iconMain}" isPrimary="true">
                      <span class="material-icons myPlan_info_icon myPlan_info_icon_status" id="myPlan_info_icon_status_${iconMain}" thisStatus="${iconMain}" isPrimary="true">${iconMain}</span>
                      <p class="dis_flex_dir_row_jsf_cntr_itmalign_cntr" thisStatus="${iconMain}" isPrimary="true">${statusMain} <span class="material-icons" thisStatus="${iconMain}" isPrimary="true">keyboard_arrow_down</span></p>
                    </div>
                  </div>
                  <div class="" thisStatus="${icon_2}" isPrimary="false">
                    <div status="" class="myPlan_info_icon_cont_status dis_flex_dir_row_jsf_cntr_itmalign_cntr select_status" forPID="${planId}" thisStatus="${icon_2}" isPrimary="false">
                      <span class="material-icons myPlan_info_icon myPlan_info_icon_status" id="myPlan_info_icon_status_${icon_2}" thisStatus="${icon_2}" isPrimary="false">${icon_2}</span>
                      <p class="dis_flex_dir_row_jsf_cntr_itmalign_cntr" thisStatus="${icon_2}" isPrimary="false">${status_2} </p>
                    </div>
                  </div>
                  <div class="" thisStatus="${icon_3}">
                    <div status="" class="myPlan_info_icon_cont_status dis_flex_dir_row_jsf_cntr_itmalign_cntr select_status" forPID="${planId}" thisStatus="${icon_3}" isPrimary="false">
                      <span class="material-icons myPlan_info_icon myPlan_info_icon_status" id="myPlan_info_icon_status_${icon_3}" thisStatus="${icon_3}" isPrimary="false">${icon_3}</span>
                      <p class="dis_flex_dir_row_jsf_cntr_itmalign_cntr" thisStatus="${icon_3}" isPrimary="false">${status_3} </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="myPlan_body_content"></div>
              <div class="myPlan_body_username">
                <p dir="rtl"><time value="${date}">${createdDate} </time>توسط <a dir="ltr">@${author}</a> ساخته شد.</p>
              </div>

            </div>
            <div class="myPlan_info dis_flex_dir_rrow_jsf_cntr_itmalign_cntr myPlan_${condition}" for="${planId}">
              <div numCont="${planId}likeNumCont" class=" myPlan_info_icon_cont myPlan_info_icon_cont_like dis_flex_dir_row_jsf_cntr_itmalign_cntr" for="${planId}" status="${condition}" liked="${likeControler}">
                <span class="material-icons myPlan_info_icon myPlan_info_icon_like" for="${planId}">${likeHtml}</span>
                <p id="${planId}likeNumCont" for="${planId}">${likeNum}</p>
              </div>
              <div class=" myPlan_info_icon_cont myPlan_info_icon_cont_watch dis_flex_dir_row_jsf_cntr_itmalign_cntr">
                <span class="material-icons myPlan_info_icon myPlan_info_icon_watch">remove_red_eye</span>
                <p>${watcheNum}</p>
              </div>
              <div class=" myPlan_info_icon_cont myPlan_info_icon_cont_reply dis_flex_dir_row_jsf_cntr_itmalign_cntr" for="${planId}" status="${condition}">
                <span class="material-icons myPlan_info_icon myPlan_info_icon_reply" for="${planId}">chat</span>
                <p for="${planId}">${replyNum}</p>
              </div>
              <div class=" myPlan_info_icon_cont myPlan_info_icon_cont_use dis_flex_dir_row_jsf_cntr_itmalign_cntr" for="${planId}" status="${condition}">
                <span class="material-icons myPlan_info_icon myPlan_info_icon_use" for="${planId}">call_split</span>
                <p for="${planId}">${useNum}</p>
              </div>
            </div>
          </div>
          `)
      }
    }else {
      $('.main_section_main').append(`
        <div class="main_section_nothing pos_abs_cntr" dir="rtl">
          <p id="main_section_nothing_faceText" dir="ltr">¯\\_(◉ヘ◉)_/¯</p>
          <p >هیچ برنامه ای وجود ندارد!</p>
          <p class="newPlan main_section_nothing_newPlan">یکی ایجاد کنید</p>
        </div>
        `);
    }
  });

  //change status
  $('.primary').on('click', '.myPlan_body_status', function (e) {
    if ($(this).attr('isOpen') == 'false') {
      $(this).find('p span').text('keyboard_arrow_up')
      $(this).css({'height': '200px', 'border-radius':'10px', 'background-color':'#f8f8f8','width':'175px'})
      $(this).attr('isOpen','true')
    }else {
      $(this).find('p span').text('keyboard_arrow_down')
      $(this).attr('style','')
      $(this).attr('isOpen','false')
    }
    let s = $(e.target).attr('thisStatus'), status;
    console.log(s);
    if (s == 'public') status = 'pblc';
    else if (s == 'work') status = 'prsnl';
    else if (s == 'lock') status = 'prvt';
    let pID = $(this).attr('for');
    if ($(e.target).attr('isPrimary') == 'false') {
      socket.emit('changeCondition', {pID, status, loginUser})
    }
  })
  socket.on('chngCondOK', function (c) {
    let u = c.u, pID = c.pID, condition = c.s;
    if (condition == 'pblc') {iconMain = 'public';icon_2 = 'work';icon_3 = 'lock'; statusMain = 'عمومی'; status_2 = 'خصوصی'; status_3 = 'شخصی';}
    else if (condition == 'prsnl') {iconMain = 'work';icon_2 = 'public';icon_3 = 'lock'; statusMain = 'خصوصی'; status_2 = 'عمومی'; status_3 = 'شخصی';}
    else if (condition == 'prvt') {iconMain = 'lock';icon_2 = 'public';icon_3 = 'work'; statusMain = 'شخصی'; status_2 = 'عمومی'; status_3 = 'خصوصی';}
    $(`#myPlan_info_icon_cont_status_${pID}`).empty();
    $(`#myPlan_info_icon_cont_status_${pID}`).attr('primary',condition);
    $(`#myPlan_info_icon_cont_status_${pID}`).append(`
      <div class="" thisStatus="${iconMain}" isPrimary="true">
        <div status="${condition}" style="background:none" class="myPlan_info_icon_cont_status dis_flex_dir_row_jsf_cntr_itmalign_cntr" forPID="${pID}" thisStatus="${iconMain}" isPrimary="true">
          <span class="material-icons myPlan_info_icon myPlan_info_icon_status" id="myPlan_info_icon_status_${iconMain}" thisStatus="${iconMain}" isPrimary="true">${iconMain}</span>
          <p class="dis_flex_dir_row_jsf_cntr_itmalign_cntr" thisStatus="${iconMain}" isPrimary="true">${statusMain} <span class="material-icons" thisStatus="${iconMain}" isPrimary="true">keyboard_arrow_down</span></p>
        </div>
      </div>
      <div class="" thisStatus="${icon_2}" isPrimary="false">
        <div status="" class="myPlan_info_icon_cont_status dis_flex_dir_row_jsf_cntr_itmalign_cntr select_status" forPID="${pID}" thisStatus="${icon_2}" isPrimary="false">
          <span class="material-icons myPlan_info_icon myPlan_info_icon_status" id="myPlan_info_icon_status_${icon_2}" thisStatus="${icon_2}" isPrimary="false">${icon_2}</span>
          <p class="dis_flex_dir_row_jsf_cntr_itmalign_cntr" thisStatus="${icon_2}" isPrimary="false">${status_2} </p>
        </div>
      </div>
      <div class="" thisStatus="${icon_3}">
        <div status="" class="myPlan_info_icon_cont_status dis_flex_dir_row_jsf_cntr_itmalign_cntr select_status" forPID="${pID}" thisStatus="${icon_3}" isPrimary="false">
          <span class="material-icons myPlan_info_icon myPlan_info_icon_status" id="myPlan_info_icon_status_${icon_3}" thisStatus="${icon_3}" isPrimary="false">${icon_3}</span>
          <p class="dis_flex_dir_row_jsf_cntr_itmalign_cntr" thisStatus="${icon_3}" isPrimary="false">${status_3} </p>
        </div>
      </div>
      `)
  });


  //like handle
  $('.primary').on('click', '.myPlan_info_icon_cont_like',function () {
    let pID = $(this).attr('for'), isLiked = $(this).attr('liked');
    let numContId = $(this).attr('numCont');
    let likeNumber = $('#'+numContId+'').html();
    if (isLiked == 'false') {
      $('.myPlan_info_icon_like[for="'+pID+'"]').text('favorite')
      $(this).attr('liked', 'true');
      socket.emit('like', {pID, loginUser});
      $('#'+numContId+'').html(+likeNumber+1);
    }else {
      $('.myPlan_info_icon_like[for="'+pID+'"]').text('favorite_border');
      $(this).attr('liked', 'false');
      socket.emit('unlike', {pID, loginUser})
      $('#'+numContId+'').html(+likeNumber-1);
    }
  })
  /*watch handle
  $('.primary').on('click', '.myPlan',function () {
    let pID = $(this).attr('id');
    socket.emit('watch', {pID, loginUser});
  })*/

  $('.primary').on('click', '.main_nav_profile_new', function (e) {
    $('#new_popUp').css('display','flex');
    $('.blackArea_1').css('display','block');
  })
  $('.primary').on('click', '.main_nav_profile_setting', function (e) {
    $('#setting_popUp').css('display','flex');
    $('.blackArea_1').css('display','block');
  })
  $('.primary').on('click', '.main_nav_profile_notif', function (e) {
    $('#notif_popUp').css('display','flex');
    $('.blackArea_1').css('display','block');
    $('.main_nav_profile_icon_alarm').css('display','none');
    localStorage.setItem("alarm", 'none');
  })
  $('.primary').on('click', '.blackArea_1', function (e) {
    $('.setting_popUp_window').css('display','none');
    $('.blackArea_1').css('display','none');
  })
  //create a plan
  $('.primary').on('click', '.newPlan', function (e) {
    table['table'] = {};
    $('.setting_popUp_window').css('display','none');
    $('.main_section_ctrl').css('display','none');
    $('.main_section_main').empty();
    $('.blackArea_1').css('display','none');
    $('.main_section_main').append(`
      <div class="main_section_main_createPlan">
        <h1 dir="rtl">یک برنامه جدید بسازید</h1>
        <div class="createPlan_sec">
          <div class="createPlan_planName">
            <span class="field_hed" for="createPlan_planCat">دسته</span>
            <span class="field_hed" style="margin-right:150px" for="createPlan_planName">عنوان <span style="color:red">*</span> </span><br>
            <select class="createPlan_field" id="createPlan__planCat" class="" name="">
              <option value="" disabled>انتخاب کنید</option>
              <option value="">پیشفرض</option>
            </select>
            <span style="font-size:30px;top:8px;position:relative">/</span>
            <input class="createPlan_field" id="createPlan_planName" type="text" maxlength="100">
            <p>شما میتوانید برنامه خود را دسته بندی کنید. اگر درون جعبه دسته چیزی ننویسید برنامه تان در دسته «پیشفرض» قرار خواهد گرفت.</p>
          </div>
          <div class="createPlan_planDes">
            <span class="field_hed" for="createPlan__planDes">توضیحات <span style="font-size:14px;color:#888;">(اختیاری)</span> </span><br>
            <input class="createPlan_field" id="createPlan__planDes" type="text" maxlength="500">
          </div>
        </div>
        <div class="createPlan_sec">
          <div class="pblc_cont dis_flex_dir_row_jsf_cntr_itmalign_cntr">
            <input class="plan_cond" type="radio" name="createPlan_planCon" value="pblc">
            <div class="pblc_des">
              <span style="color:var(--logo)" class="material-icons cond_icon">public</span>
            </div>
            <div class="pblc_txt dis_flex_dir_col_jsf_cntr_itmalign_cntr">
              <h3>عمومی</h3>
              <p>اگر این وضعیت را انتخاب کنید، برنامه شما برای دیگران قابل مشاهده است. دیگران میتوانند از برنامه شما استفاده کنند، درباره آن نظر بدهند یا برای شما پیشنهاد تغییر ارسال کنند. این وضعیت مناسب زمانی است که میخواهید دیگران از برنامه شما مطلع باشند.</p>
            </div>
          </div>
          <div class="pblc_cont dis_flex_dir_row_jsf_cntr_itmalign_cntr">
            <input class="plan_cond" type="radio" name="createPlan_planCon" value="prsnl">
            <div class="pblc_des">
              <span style="color:#09af00" class="material-icons cond_icon">work_outline</span>
            </div>
            <div class="pblc_txt dis_flex_dir_col_jsf_cntr_itmalign_cntr">
              <h3>خصوصی</h3>
              <p>برنامه های خصوصی برای همه قابل دیدن نیستند. با انتخاب این وضعیت، تنها دوستان منتخب شما میتوانند برنامه را مشاهده کنند. کسانی که جزو دوستان شما نیستند، این برنامه ها را بصورت قفل شده در پروفایل شما میبینند و دسترسی به محتوای آن ندارند. </p>
            </div>
          </div>
          <div class="pblc_cont dis_flex_dir_row_jsf_cntr_itmalign_cntr">
            <input class="plan_cond" type="radio" name="createPlan_planCon" value="prvt">
            <div class="pblc_des ">
              <span style="color:#B71C1C" class="material-icons cond_icon">lock</span>
            </div>
            <div class="pblc_txt dis_flex_dir_col_jsf_cntr_itmalign_cntr">
              <h3>شخصی</h3>
              <p>برنامه های شخصی تنها برای شما قابل دیدن هستند و کسی از آنها مطلع نمی شود. برنامه های شخصی در پروفایل شما قرار نمیگیرند و تعداد آنها نیز نمایش نمی یابد.برنامه های شخصی برای زمانی مناسب است که نمی خواهید کسی از برنامه شما مطلع شود.</p>
            </div>
          </div>
        </div>
        <div class="createPlan_sec">
          <h2 class="table_container_hed">جدول را طراحی کنید</h2>
          <div class="table_container dis_flex_dir_col_jsf_cntr_itmalign_cntr"></div>
          <div class="add_row dis_flex_dir_row_jsf_cntr_itmalign_cntr">
            <i class="material-icons">&#xe145;</i>
            <h4>ردیف</h4>
          </div>
        </div>
        <div class="createPlan_sec create_tableـsec dis_flex_dir_row_jsf_cntr_itmalign_cntr">
          <div class="create_table dis_flex_dir_row_jsf_cntr_itmalign_cntr">
            <h3>ساخت برنامه</h3>
          </div>
          <p class="create_error"></p>
        </div>
      </div>
      `);
  })

  //

  //add row
  var rowCol = [];
  $('.primary').on('click', '.add_row', function (e) {
    rowCol.push([])
    let style = '';
    table['table']['row'+rowCol.length] = {};
    if (rowCol.length == 1) {
      style = 'style="color:red !important"'
    }
    $('.table_container').append(`
      <div class="table_row table__row${rowCol.length} dis_flex_dir_row_jsf_cntr_itmalign_cntr" rowId="${rowCol.length}">
        <span class="material-icons row_close_icon" ${style}>close</span>
          <div class="gradient gradient_left" id="left"></div><div class="gradient gradient_right" id="right"></div>
        <div class="table_row_colContainer dis_flex_dir_row_jsf_cntr_itmalign_cntr" id="row${rowCol.length}">
        </div>
        <div class="add_col dis_flex_dir_row_jsf_cntr_itmalign_cntr" rowIdCont="${rowCol.length}">
          <i class="material-icons">&#xe145;</i>
          <h4>جعبه</h4>
        </div>
      </div>
      `);
    $('html').scrollTop($(document).height());
  })
  //add column
  $('.primary').on('click', '.add_col', function (e) {
    let r = $(this).attr('rowIdCont');
    let c = rowCol[r-1].length;
    var s = '';
    if (r != 1) {
      c = $('#row1').children().eq(c).attr('colId');
      if (c <= rowCol[0].length) {
        rowCol[r-1].push('col'+c);
        if (c < 7) {
          s = 'style="background-color:'+color[c-1]+'"'
          if (c == 0 || c == 2) {
            s = 'style="background-color:'+color[c-1]+';color:white"'
          }
        }else {
          s = 'style="background-color:'+color[Math.round(c%6)]+'"'
          if (c == 0 || c == 2) {
            s = 'style="background-color:'+color[c-1]+';color:white"'
          }
        }
        table['table']['row'+r]['col'+c] = {};
        table['table']['row'+r]['col'+c]['lock'] = '';
        table['table']['row'+r]['col'+c]['align'] = 'c';
        table['table']['row'+r]['col'+c]['location'] = {};
        table['table']['row'+r]['col'+c]['tag'] = {};
        table['table']['row'+r]['col'+c]['attach'] = {};
        table['table']['row'+r]['col'+c]['comment'] = '';
        $('#row'+r+'').append(`
          <div ${s} class="table_col table_row${r}_col${c} dis_flex_dir_col_jsf_cntr_itmalign_cntr" id="row${r}_col${c}" rowNum = "${r}" colId ="${c}">
            <span class="material-icons col_close_icon">close</span>
            <div contenteditable="true" class="table_col_content" id="row${r}_col${c}_cont" placeholder="چیزی بنویسید" rowNum = "${r}" colId ="${c}"></div>
            <div class="table_col_options dis_flex_dir_row_jsf_cntr_itmalign_cntr">
              <span class="material-icons col_option_icon lock_op" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">lock</span>
              <span class="material-icons col_option_icon copy_op" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">content_copy</span>
              <span class="material-icons col_option_icon r_op row${r}_col${c}_textOp" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">align_horizontal_right</span>
              <span class="material-icons col_option_icon c_op row${r}_col${c}_textOp" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">align_horizontal_center</span>
              <span class="material-icons col_option_icon l_op row${r}_col${c}_textOp" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">align_horizontal_left</span>
              <span class="material-icons col_option_icon loc_op row${r}_col${c}_textOp" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">place</span>
              <span class="material-icons col_option_icon tag_op row${r}_col${c}_textOp" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">person_pin</span>
              <span class="material-icons col_option_icon attch_op row${r}_col${c}_textOp" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">attach_file</span>
              <span class="material-icons col_option_icon comm_op row${r}_col${c}_textOp" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">insert_comment</span>
            </div>
          </div>
          `);
          $('.table_row_colContainer').scrollLeft($('.table_row_colContainer').width());
      }else {
        alert('شما نمی توانید بیشتر از ردیف اصلی ستون ایجاد کنید.')
      }
    }else {
      let c = rowCol[r-1].length;
      c =c+1;
      rowCol[r-1].push('col'+c);
      c = rowCol[r-1].length;
      if (c < 7) {
        s = 'style="background-color:'+color[c-1]+'"'
        if (c == 0 || c == 2) {
          s = 'style="background-color:'+color[c-1]+';color:white"'
        }
      }else {
        s = 'style="background-color:'+color[Math.round(c%6)]+'"'
        if (c == 0 || c == 2) {
          s = 'style="background-color:'+color[c-1]+';color:white"'
        }
      }
      table['table']['row'+r]['col'+c] = {};
      table['table']['row'+r]['col'+c]['lock'] = '';
      table['table']['row'+r]['col'+c]['align'] = 'c';
      table['table']['row'+r]['col'+c]['location'] = {};
      table['table']['row'+r]['col'+c]['tag'] = {};
      table['table']['row'+r]['col'+c]['attach'] = {};
      table['table']['row'+r]['col'+c]['comment'] = '';
      $('#row'+r+'').append(`
        <div ${s} class="table_col table_row${r}_col${c} dis_flex_dir_col_jsf_cntr_itmalign_cntr" id="row${r}_col${c}" rowNum = "${r}" colId ="${c}">
          <span class="material-icons col_close_icon">close</span>
          <div contenteditable="true" class="table_col_content" id="row${r}_col${c}_cont" placeholder="چیزی بنویسید" rowNum = "${r}" colId ="${c}"></div>
          <div class="table_col_options dis_flex_dir_row_jsf_cntr_itmalign_cntr">
            <span class="material-icons col_option_icon lock_op" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">lock</span>
            <span class="material-icons col_option_icon copy_op" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">content_copy</span>
            <span class="material-icons col_option_icon r_op row${r}_col${c}_textOp" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">align_horizontal_right</span>
            <span class="material-icons col_option_icon c_op row${r}_col${c}_textOp" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">align_horizontal_center</span>
            <span class="material-icons col_option_icon l_op row${r}_col${c}_textOp" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">align_horizontal_left</span>
            <span class="material-icons col_option_icon loc_op row${r}_col${c}_textOp" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">place</span>
            <span class="material-icons col_option_icon tag_op row${r}_col${c}_textOp" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">person_pin</span>
            <span class="material-icons col_option_icon attch_op row${r}_col${c}_textOp" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">attach_file</span>
            <span class="material-icons col_option_icon comm_op row${r}_col${c}_textOp" for="row${r}_col${c}" rowNum = "${r}" colId ="${c}">insert_comment</span>
          </div>
        </div>
        `);
        $('.table_row_colContainer').scrollLeft($('.table_row_colContainer').width());
        console.log($('.table_row_colContainer').width());
    }
    console.log(table);
  })
  //add column for deleted column
  $('.primary').on('click', '.add_col_ex',function (e) {
    var r = $(this).attr('forR');
    var c = $(this).attr('forC');
    $(this).remove();
    $('.table_col[id="'+r+'_'+c+'"]').append(`
      <span class="material-icons col_close_icon">close</span>
      <div contenteditable="true" class="table_col_content" id="row${r}_col${c}_cont" placeholder="چیزی بنویسید"></div>
      <div class="table_col_options dis_flex_dir_row_jsf_cntr_itmalign_cntr">
        <span class="material-icons col_option_icon lock_op" for="row${r}_col${c}">lock</span>
        <span class="material-icons col_option_icon copy_op" for="row${r}_col${c}">content_copy</span>
        <span class="material-icons col_option_icon r_op row${r}_col${c}_textOp" for="row${r}_col${c}">align_horizontal_right</span>
        <span class="material-icons col_option_icon c_op row${r}_col${c}_textOp" for="row${r}_col${c}">align_horizontal_center</span>
        <span class="material-icons col_option_icon l_op row${r}_col${c}_textOp" for="row${r}_col${c}">align_horizontal_left</span>
        <span class="material-icons col_option_icon loc_op row${r}_col${c}_textOp" for="row${r}_col${c}">place</span>
        <span class="material-icons col_option_icon tag_op row${r}_col${c}_textOp" for="row${r}_col${c}">person_pin</span>
        <span class="material-icons col_option_icon attch_op row${r}_col${c}_textOp" for="row${r}_col${c}">attach_file</span>
        <span class="material-icons col_option_icon comm_op row${r}_col${c}_textOp" for="row${r}_col${c}">insert_comment</span>
      </div>
      `);
  })
  //store title
  $('.primary').on('blur', '#createPlan_planName', function () {
    let title = $(this).val()
    table['title'] = title;
    if (!table['description']) {
      table['description'] = '';
    }
    if (!table['category']) {
      table['category'] = '';
    }
  })
  //store category
  $('.primary').on('click', 'select', function () {
    let cat = $(this).val()
    table['category'] = cat;
  })
  $('.primary').on('blur', '#createPlan__planDes', function () {
    let des = $(this).val()
    table['description'] = des;
  })

  //store plan securty
  $('.primary').on('click', '.plan_cond', function () {
    let sec = $(this).val()
    table['condition'] = sec;
  })
  //store boxes
  $('.primary').on('blur', '.table_col_content', function () {
    let content = $(this).text()
    let r = $(this).attr('rowNum')
    let c = $(this).attr('colId')
    table['table']['row'+r]['col'+c]['content'] = content;
    console.log(table);
  })

  //delete column
  $('.primary').on('click', '.col_close_icon', function (e) {
    let r = $(this).parent().attr('rowNum');
    let c = $(this).parent().attr('colId');
    if (r == 1) {
      $('*[colId="'+c+'"]').remove();
      delete table['table']['row1']['col'+c];
      var a = rowCol[0][c-1];
      for (var i = 1; i < rowCol.length; i++) {
        console.log(rowCol[i]);
        var x = rowCol[i].indexOf(a);
        console.log(x);
        if (x != -1) {
          rowCol[i].splice(x, 1);
          let z = i+1, y = x +1
          delete table['table']['row'+z]['col'+y];
        }
      }
      console.log(table);
    }else {
      $(this).parent().empty();
      $('.table_col[id="row'+r+'_col'+c+'"]').html(`
        <div class="add_col_ex dis_flex_dir_row_jsf_cntr_itmalign_cntr" forR="row${r}" forC="col${c}">
          <i class="material-icons">&#xe145;</i>
        </div>`
      );
    }

  })

  //delete row
  $('.primary').on('click', '.row_close_icon', function (e) {
    let r = $(this).parent().attr('rowId');
    if (r == 1 && $('.table_row').length > 1) {
      let a = confirm('اگر ردیف اصلی را حذف کنید، تمام جدول از دست می رود.');
      if (a) {
        $('.table_container').empty();
        rowCol = [];
        table['table'] = {};
      }
    }else {
      if (r == 1) {
        rowCol = [];
      }
      delete table['table']['row'+r];
      $(this).parent().remove();
    }
    console.log(table);
  })


  $('.primary').on('click', '.lock_op', function (e) {
    let r = $(this).attr('rowNum')
    let c = $(this).attr('colId')
    if ($(this).css('color') != 'rgb(46, 198, 248)') {
      $(this).css('color','var(--logo)');
      table['table']['row'+r]['col'+c]['lock'] = true;
      console.log(table);
    }else {
      $(this).css('color','#999');
      table['table']['row'+r]['col'+c]['lock'] = '';
    }
  })
  /*$('.primary').on('click', '.copy_op', function (e) {
    let id = $(this).attr('for');
    let content = $('#'+id+'_cont').text();
  })*/
  $('.primary').on('click', '.r_op', function (e) {
    let r = $(this).attr('rowNum')
    let c = $(this).attr('colId')
    let id = $(this).attr('for');
    $('#'+id+'_cont').css('text-align','right');
    $('.'+id+'_textOp').css('color','#999');
    $(this).css('color','#333');
    table['table']['row'+r]['col'+c]['align'] = 'r';
    console.log(table);
  })
  $('.primary').on('click', '.c_op', function (e) {
    let r = $(this).attr('rowNum')
    let c = $(this).attr('colId')
    let id = $(this).attr('for');
    $('#'+id+'_cont').css('text-align','center');
    $('.'+id+'_textOp').css('color','#999');
    $(this).css('color','#333');
    table['table']['row'+r]['col'+c]['align'] = 'c';
    console.log(table);
  })
  $('.primary').on('click', '.l_op', function (e) {
    let r = $(this).attr('rowNum')
    let c = $(this).attr('colId')
    let id = $(this).attr('for');
    $('#'+id+'_cont').css('text-align','left');
    $('.'+id+'_textOp').css('color','#999');
    $(this).css('color','#333');
    table['table']['row'+r]['col'+c]['align'] = 'l';
    console.log(table);
  })

  //submit and send plan to server
  $('.primary').on('click', '.create_table', function (e) {
    let user = localStorage.getItem("username")
    if ($('#createPlan_planName').val() != '' && $('.plan_cond').is(':checked')) {
      $('.main_section_main_createPlan').css('display','none');
      $('.main_section_ctrl').css('display','block');
      socket.emit('table', {table, user});
    }else if ($('#createPlan_planName').val() == '') {
      $('.create_error').html('شما باید عنوانی برای برنامه تان ایجاد کنید')
    }
    else if (!$('.plan_cond').is(':checked')) {
      $('.create_error').html('شما باید وضعیت نمایش برنامه تان را مشخص کنید')
    }
  })

  //auto scroll
  $('.primary').on('mouseover', '.gradient', function (e) {
    var dir = $(this).attr('id')=="right" ? '+=' : '-=' ;
    $('.table_row_colContainer').animate({scrollLeft: dir+'1000'}, 1000);
  })

  //exit account
  $('.primary').on('click', '#setting_popUp_window_content_exit', function () {
    localStorage.setItem('username', '');
    localStorage.setItem('password', '');
    location.href="logIn.html";
  })


  //get table
  socket.on('giveTable', function (t) {
    console.log(t);
  })
  //get search resault
  socket.on('searchLiveResault', function (r) {
    $('.search_resault').empty();
    t = r.srchRes, rTime = r.timeRes;
    //console.log(rTime);
    let clicked = 'false', reqIcon = 'aforward', reqTxt = 'درخواست دوستی', reqStyle = 'background : none';
    if (!t) {
      $('.search_resault').empty();
      $('.search_resault').append(`
        <div class="search_resault_noRes dis_flex_dir_col_jsf_cntr_itmalign_cntr">
          <p>乁(⩾_⩽)ㄏ</p>
          <p>هیچ نتیجه ای یافت نشد</p>
        </div>`)
      }else {
        $('.search_resault').empty();
        for (var i = 0; i < t.length; i++) {
          if (t[i].friendReqToMe) {
            t[i].friendReqToMe.forEach((item, k) => {
              if (item == loginUser) {
                clicked= 'true';
                reqIcon = 'access_time';
                reqTxt = 'ارسال شده';
                reqStyle = 'background-color : #E0F7FA';
              }
            });
          }
          $('.search_resault').append(`
            <div class="search_resault_user dis_flex_dir_col_jsf_cntr_itmalign_cntr" username="${t[i].username}">
              <div class="search_resault_user_profile dis_flex_dir_row_jsf_cntr_itmalign_cntr">
                <div class="search_resault_user_profilePrim dis_flex_dir_row_jsf_cntr_itmalign_cntr">
                  <div class="search_resault_user_profile_pic">
                    <img src="${t[i].proPic}" alt="">
                  </div>
                  <div class="search_resault_user_profile_name">
                    <h1>${t[i].name}</h1>
                    <p dir="ltr">@${t[i].username}</p>
                  </div>
                </div>
                <div style="${reqStyle}" class="search_resault_user_profile_friendRec dis_flex_dir_row_jsf_cntr_itmalign_cntr" username="${t[i].username}" clicked="${clicked}">
                  <div class="search_resault_user_profile_friendRec_cont dis_flex_dir_row_jsf_cntr_itmalign_cntr">
                    <span class="material-icons search_resault_user_profile_friendRecIcon">${reqIcon}</span>
                    <p class="search_resault_user_profile_friendRecText">${reqTxt}</p>
                  </div>
                </div>
              </div>
              <div class="search_resault_user_plans  dis_flex_dir_row_jsf_cntr_itmalign_cntr" id="${t[i].username}SearchPlans"></div>
              <div class="search_resault_user_social dis_flex_dir_rrow_jsf_cntr_itmalign_cntr">
                <div class="search_resault_user_social_friends dis_flex_dir_row_jsf_cntr_itmalign_cntr" friendsNum="${t[i].friends.length}">
                  <span class="search_resault_user_social_friendsNum">${t[i].friends.length}</span>
                  <p class="search_resault_user_social_friends_title">دوست</p>
                </div>
                <div class="search_resault_user_social_plans dis_flex_dir_row_jsf_cntr_itmalign_cntr" plansNum="${rTime[i].length}">
                  <span class="search_resault_user_social_plansNum">${rTime[i].length}</span>
                  <p class="search_resault_user_social_plans_title">برنامه قابل مشاهده</p>
                </div>
              </div>
            </div>
            `)
            if (t[i].username == loginUser) {
              $('.search_resault_user_profile_friendRec[username="'+t[i].username+'"]').remove();
            }
            for (var j = 0; j < rTime[i].length; j++) {
              //console.log(rTime[i]);
              let timeColor = Object.values(rTime)[i][j].dateTime.split(' ')[1].split(':');
              let dateColor = Object.values(rTime)[i][j].dateTime.split(' ')[0].split('-');
              let rgbArg1 = Math.round(((+timeColor[0]+dateColor[0])/232020)*225) , rgbArg2 = Math.round(((+timeColor[1]+dateColor[1])/5912)*225), rgbArg3 = Math.round(((timeColor[2]+dateColor[2])/5930)*225);
              let rgbColor = `rgb(${rgbArg1},${rgbArg2},${rgbArg3})`;
              $(`#${t[i].username}SearchPlans`).append(`
                <div style="background-color:${rgbColor}" class="search_resault_user_plans_plan dis_flex_dir_row_jsf_cntr_itmalign_cntr" id="${t[i].plans[j].planId}"></div>`)
              if (rTime[i][j].condition == 'prsnl') {
                $(`#${t[i].plans[j].planId}`).append(`<div class="search_resault_user_plans_plan_icons"><span class="material-icons search_resault_user_plans_plan_icon">lock</span></div>`)
              }
            }

        }
      }
  })



  //global search
  $('.primary').on('input', '.main_nav_search', function (e) {
    let searchLiveResault = $(this).val();
    socket.emit('searchLiveResault', searchLiveResault);
    if (searchLiveResault == '') {
      $('.search_resault').empty();
      $('.search_resault').append(`
        <div class="search_resault_noSrch dis_flex_dir_col_jsf_cntr_itmalign_cntr">
          <p>ᕙ(◉◞ ◉)ᕗ</p>
        </div>`)
      }
  })
  $('.primary').on('click', '.main_nav_search', function (e) {
    $('.search_resault').css({'height': '400px','padding': '20px'});
    $('.blackAreaSearch').css({'display':'block'});
  })
  $('.primary').on('click', '.blackAreaSearch', function (e) {
    $('.search_resault').css({'height': '0','padding': '0'});
    $(this).css({'display':'none'});
    $('.main_nav_search').val('');
    $('.search_resault').empty();
    $('.search_resault').append(`
      <div class="search_resault_noSrch dis_flex_dir_col_jsf_cntr_itmalign_cntr">
        <p>ᕙ(◉◞ ◉)ᕗ</p>
      </div>`)
  })

  //search click
  $('.primary').on('click', '.search_resault_user', function (e) {
    let user = $(this).attr('username');
    $('.blackAreaSearch').trigger('click');
    if (user != loginUser) {
      socket.emit('searchClick', user);
    }
  })
  //send friend request
  $('.primary').on('click', '.search_resault_user_profile_friendRec', function (e) {
    let user = $(this).attr('username');
    if (user != loginUser) {
      socket.emit('searchClick', user);
    }
    if ($('.search_resault_user_profile_friendRec[username="'+user+'"]').attr('clicked') == 'true') {
      socket.emit('cancelFriendRec', {user, loginUser});
    }else {
      socket.emit('sendFriendRec', {user, loginUser});
    }
    e.stopPropagation()
  })
  //gettingg resault
  socket.on('requestedForFriendship', function (r) {
    $('.search_resault_user_profile_friendRec[username="'+r+'"]').attr('clicked','true')
    $('.search_resault_user_profile_friendRec[username="'+r+'"] div p').text('ارسال شد')
    $('.search_resault_user_profile_friendRec[username="'+r+'"] div span').html('access_time')
    $('.search_resault_user_profile_friendRec[username="'+r+'"]').css('background-color','#E0F7FA')
  })
  socket.on('canceledForFriendship', function (r) {
    $('.search_resault_user_profile_friendRec[username="'+r+'"]').attr('clicked','false')
    $('.search_resault_user_profile_friendRec[username="'+r+'"] div p').text('درخواست دوستی')
    $('.search_resault_user_profile_friendRec[username="'+r+'"] div span').html('aforward')
    $('.search_resault_user_profile_friendRec[username="'+r+'"]').css('background','none')
  })












});

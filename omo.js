<script>
$(function(){

$(document).on('click','.search_result_each_box',function(){
    var this_box = $(this)[0];
    var result_box_id = $(this_box).attr("id");
    $("#search_result_preview").attr("data-preview-id",result_box_id);
    preview();
        preview_set.val.article_id = result_box_id;
        Aj(preview_set);
});

function preview(){
        $("#menue_panel").stop().animate({scrollTop:0},0);
        $("#search_result_preview").animate({right:'0'},{ easing:'easeOutCirc' , duration:200});
        $("#search_icon").fadeOut();
        /*  読み込み   result_preview_titleタイトル　*/

}

$("#result_previe_bt_back").click(function(){
    var preview_id = '#' + $("#search_result_preview").attr("data-preview-id");
    var preview_pos = $(preview_id).offset().top - 10;
    $("#menue_panel").stop().animate({scrollTop:preview_pos+'px'},0);
    $("#search_result_preview").animate({right:'-100%'},{ easing:'easeOutCirc' , duration:200});
    $("#search_icon").fadeIn();
});

    $("#search_box").keydown(function(d){
        if(d.keyCode ==13){
            $('#search_bt').click();
        }
    });

/////////////////

    function blink(keywords , strings ,set){
        var reg_flag =false;
        var memo =[];
        var over_strings = strings.length > 100 ? "... ":"";
        var keywords_count = keywords.length;

    for (var x = 0 ; x < keywords_count; x++) {
        var regexp_flag = new RegExp (keywords[x] ,'i');
        var regexp_multi = new RegExp (keywords[x] ,'ig');
        if (regexp_flag.test(strings)) {
            //get_index
            var index_pos = strings.match(regexp_flag).index + keywords[x].length +100;
            if ( set === "section"){
                strings = strings.slice(Math.max(0, index_pos-250) , Math.min( strings.length, index_pos)) + over_strings ;
                }
            strings = strings.replace(regexp_multi, '<span class="_b_Z___">'+keywords[x]+'</span>');
        }
    }
        return strings;
    }

/////////////////


var category_list_show = {
    url : "./cgi-bin/aj_search/search_keywords.py",
    val :{"keywords":"" , "Debug":true},
    before : function (){
    },
    success : function (res_json){
    //console.log(res_json.response.length, res_json.keywords);
    var len = res_json.response.length;
    if ( len > 0 ){
        $("#search_result").empty();
        $("#search_result").append('<p class="search_len"><span>'+len+'</span> results</p>');
        var keywords = res_json.keywords;
        for (var f=0; f < len; f++) {
            var res_title = blink(keywords , res_json.response[f][1] ,"");
            var res_section = blink(keywords , res_json.response[f][2],"section");
            $("#search_result").append('<div class="search_result_each_box" id="'+res_json.response[f][0]+'"><div class="title">'+res_title+'</div><div class="section"><pre>'+res_section+'</pre></div><p class="categories">'+res_json.response[f][3]+'</p><p class="date">'+res_json.response[f][4]+'</p></div>');
        }
    }else{
        $("#search_result").empty().append("<p>...Not Found</p>");
    }
        //console.log(res_json);
    },
    fail : function ( xhr, status, errorThrown){
        console.log( xhr.status);
    },
    always : function (){
    }
};


var preview_set = {
    url : "./cgi-bin/aj_search/search_get_preview.py",
    val :{"article_id":""},
    before : function (){

    },
    success : function (res_json){
        //title
        $("#result_preview_title").text(res_json["response"][0][1]);
        //code
        var fo = res_json["response"][0][2].substr(2).split(/\"\]\[\"/);
        //末尾に]"がある
        console.log(fo);
    },
    fail : function ( xhr, status, errorThrown){
        console.log( xhr.status);
    },
    always : function (){
    }
};

var save_data = {
    url : "./cgi-bin/aj_edit/save_data.py",
    val :{"datapack":"","flag":""},
    before : function (){

    },
    success : function (res_json){
        console.log(res_json);

        var gom = JSON.parse(res_json[0]);
        console.log(gom[1]);

        //var res = res_json.split(/","/);
        //console.log(res[0].replace(/\["/,''));
    },
    fail : function ( xhr, status, errorThrown){
        console.log( xhr.status);
    },
    always : function (){
    }
};

/*
            //発火
            //Aj(category_list_show);
            ////////////////SLIDE SIDE MENUE

*/

    $("#search_bt").click(function(){
            category_list_show.val.keywords= $("#search_box").val();
            Aj(category_list_show);
    });

////



    $("#save_data").click(function(){
    var pre_data = {};
    var total_save_data = {};
        //title
            var title_data= $("#form_title").val().trim();
            if (title_data == "" || title_data.length < 2 || title_data.length > 30) {
                    $("#form_title").focus();
                    Materialize.toast('タイトルを入力してください。', 2000);
                    return false;
            }

        //get Text or Code
        $("#append_area_pre .view_result").each(function(e){
                var index_num = $(".view_result").index(this);
                var view_id = $(this).attr("id");
                // predata ={ 0:"id____","textarea_____" , };
                total_save_data[index_num] =  JSON.stringify ([ view_id, $(this).text()]);
        });
        total_save_data['title'] = title_data;
        total_save_data["article_id"] = $("#append_area_pre").attr("data-article-id");
        total_save_data["count"] = $("#append_area_pre .view_result").length;
        total_save_data['category']= "TEST_XXX";
        save_data.val.datapack= total_save_data;
        //FLAG
        if ($("#headers").attr("data-edit-status") == "create" ) {
            save_data.val.flag = "create";
            total_save_data['flag'] = "create"
        } else {
            save_data.val.flag = "update";
            total_save_data['flag'] = "update"
        }
            Aj(save_data);
    });





// Menue Close
    $("#menue_panel_close").click(function(){
        $("#menue_panel").removeClass("menue_panel_pos_on").addClass("menue_panel_pos_default");
        $(".menue_bt").removeClass("menue_panel_on_bg");
    });


/*
    :: Ajax ::
*/
function Aj(set){
    set.before();
    $.ajax({
        cache : false,
        type : "POST",
        dataType : "json",
        url : set.url,
        data : set.val,
    })
    .done(function( json ) {
        set.success(json);
    })
    .fail(function( xhr, status, errorThrown ) {
        set.fail( xhr, status, errorThrown);
    })
    .always(function( xhr, status ) {
        set.always();
    });
}

    $("#category_bt").click(function(){
        $("#category_box").removeClass("category_pos_default").addClass("category_pos_on");
    });
    $("#close_collapsible").click(function(){
        $("#category_box .active").click();
        $("#category_box").removeClass("category_pos_on").addClass("category_pos_default");
    });
/*
    $('.collapsible').collapsible({
      accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
*/
    $(document).on('scroll',function(){
        if ($(this).scrollTop() > 10) {
            $(".column_header_bg").addClass("header_bg_on z-depth-1");
        }else if ($(this).scrollTop() <= 10) {
            $(".column_header_bg").removeClass("header_bg_on z-depth-1");
        }
    });
/*-----
    Date
---*/
var date= {
        "init": new Date(),
        "Year":function(){
            return this.init.getFullYear();
        },
        "Month_string":function(){
            var name_list =['Jan.','Feb.','Mar.','Apr.','May','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'];
            return name_list[this.init.getMonth()];
        },
        "Month":function(){
            return this.zero(this.init.getMonth() + 1);
        },
        "Day":function(){
            return this.zero(this.init.getDate());
        },
        "Hours":function(){
            return this.zero(this.init.getHours());
        },
        "Min":function(){
            return this.zero(this.init.getMinutes());
        },
        "Sec":function(){
            return this.zero(this.init.getSeconds());
        },
        "Mill":function(){
            return this.init.getMilliseconds();
        },
        "Now":function(number){
            var date_string = [this.Year() , this.Month() , this.Day() ,this.Hours(),this.Min(),this.Sec()];
            var date_string_len = date_string.length;
            var limit = date_string_len - number ;
            var pos = number > date_string_len ? date_string_len : number ;
            date_string.splice(pos,limit);
            return date_string.join("");
        },
        "zero":function(number){
                var mold = String(number).length < 2 ? "0"+ number : number ;
                return mold;
        }
};

/*-------
    RANDOM
--------*/
var random = {
    "numeric":function(number){
        var numeric_string="";
            for ( i=0; i<number; i++ ) {
                numeric_string += String((~~(Math.random()*9)));
            }
        return Number(numeric_string);
    },
    "alpha":function(number){
        var alpha_string="";
            for(i=0;i<number;i++){
                var ran = (~~(Math.random()*(36-11)+11));
                alpha_string += ran.toString(36)
            }
        return alpha_string;
    },
    "alphanumeric" : function(number){
        return Math.random().toString(36).slice(-number);
    }
};


//
function resize_column(){
    var w = $('body,html').height();
    var anchor = $(".anchor").offset().top;
        if (anchor > w) {
            $("#column2 , #column3").stop().animate({height:anchor+'px'});
        } else {
            $("#column2 , #column3").stop().animate({height:w+'px'});
        }
}



var article_id = random.alpha(8)+date.Now(6);
$("#append_area_pre").attr("data-article-id" , article_id);



// height


//Menue Open or Move layer

    $(".menue_bt").click(function(){
            $(".menue_bt").not(this).removeClass("menue_panel_on_bg");
            $(this).toggleClass("menue_panel_on_bg");

        if ( !$("#menue_panel").hasClass("menue_panel_pos_on") ) {
            $("#menue_panel").removeClass("menue_panel_pos_default").addClass("menue_panel_pos_on");
        }
        //slide left
        var get_this_id =$(this).attr("id");
            if (get_this_id == "menue_search0") {
                $('#search_box').focus();
            }
        // addjest menue each width
        $(window).resize();

        var target_num = Number(get_this_id.slice(-1));
        var this_pos = www * target_num ;
        $("#menue_panel").stop().animate({scrollLeft:this_pos+'px' , scrollTop:0},0);
        $("#menue_panel_header").stop().animate({left:this_pos +'px'},{ easing:'easeOutCirc' , duration:400});
    });


/*
リサイズ時にresize () が聴かない...関数の整理が必要。。。。
*/
var www = Number($("#menue_search_list").width()) ;
    $(window).resize(function(){
         www = Number($("#menue_search_list").width()) ;
        //var mos = $(".menue_panel_on_bg").attr("id");
    if( $(".menue_bt").hasClass("menue_panel_on_bg") ){
        var get_this_id =$(".menue_panel_on_bg").attr("id");
        var target_num = Number(get_this_id.slice(-1));
        var this_pos = www * target_num ;
        $("#menue_panel").stop().animate({scrollLeft:this_pos+'px'},0);
        $("#menue_panel_header").stop().animate({left:this_pos +'px'},{ easing:'easeOutCirc' , duration:400});
    }
         resize_column();
    });

// menues
$(document).on('click','.corner_bg',function(){
    $(this).next(".nav-toggle").click();
});
$(document).on('click','.nav-toggle',function(){
    var elem = $(this)[0];
    $(elem).toggleClass( "active" );
    $(elem).prev(".corner_bg").toggleClass("active_bg");
});

/*----
    Sort
----*/
$(document).on('mouseup','.list_up',function(){
    var box = $(this)[0];
    var box_parent = $(box).closest(".form_box");
    var box_id_pre = '#' + $(box_parent).attr('id') + 'pre';

    if ( $(box_parent).prev(".form_box").length > 0 ) {
            var insert = $(box_parent).prev(".form_box").clone();
            var insert_pre = $(box_id_pre).prev(".view_result").clone();
            $(box_parent).prev(".form_box").remove();
            $(box_id_pre).prev(".view_result").remove();
            $(box_parent).after(insert);
            $(box_id_pre).after(insert_pre);
    }
});
$(document).on('mouseup','.list_down',function(){
    var box = $(this)[0];
    var box_parent = $(box).closest(".form_box");
    var box_id_pre = '#' + $(box_parent).attr('id') + 'pre';

    if ( $(box_parent).next(".form_box").length > 0 ) {
            var insert = $(box_parent).next(".form_box").clone();
            var insert_pre = $(box_id_pre).next(".view_result").clone();
            $(box_parent).next(".form_box").remove();
            $(box_id_pre).next(".view_result").remove();
            $(box_parent).before(insert);
            $(box_id_pre).before(insert_pre);
    }
});

/*----
    Delete
----*/
$(document).on('click','.list_remove',function(){
    var box = $(this)[0];
    var box_parent = $(box).closest(".form_box");
    var box_id = '#'+ $(box_parent).attr('id') +'pre';
        $(box_id).slideUp(300,function(){
                $(this).remove();
        });
        $(box_parent).slideUp(300,function(){
                $(this).remove();
                 resize_column();
        });
});


/*----
    Refresh button
--------*/
$(document).on('click' , '.refresh_code' ,function(){
    var form_id = $(this)[0];
    var code_id = $(form_id).closest(".form_box").attr('id') +'pre';
    var codeBox = document.getElementById(code_id);
        //一度、codeの中身を削除する。 & view_result のクラス名からhljs関連も削除::view_result view_codeのみにする
        //console.log(codeBox.classList[2]);
            if (codeBox.classList[3] != null) {
                    $(codeBox).removeClass(codeBox.classList[3]);
            }
        var re_val = $(form_id).closest(".form_box").find("textarea").val();
        $(codeBox).find("code").empty().text(re_val);
    hljs.highlightBlock(codeBox);
});

/*-----
    Add Form
--------*/

$(".add_form").click(function(){
    //button status
    var bt_status = $(this).attr("id");
    if ( bt_status.match(/\w+_code/) != null ) {
        var set_bg_color = "corner_bg_code";
        var flag = "code";
    } else {
        var set_bg_color = "corner_bg_text";
        var flag = "text";
    }
    var date_fresh = Object.create(date, {'init' : { value : new Date() }});
    var set_id = random.alpha(5) + date_fresh.Now(9);
    var set_id_preview = set_id + 'pre';
    // Add Form & Preview
    var get_add_parts = $('#warehouse .form_box').clone();
    var get_add_preview = $('#warehouse .view_result').clone();
            if (flag === "code") {
                $(get_add_parts).addClass("code_flag");
                $(get_add_preview).addClass("view_code");
                $(get_add_preview).append('<code></code>');
            }else{
                $(get_add_parts).find(".code_only").remove();
            }
    $(get_add_parts).find(".corner_bg , .form_bg").addClass(set_bg_color);
    $(get_add_parts).prependTo("#append_area").fadeIn(400).attr('id',set_id);
    var get_height = $(get_add_parts).height() -8;
    $(get_add_preview).prependTo("#append_area_pre").fadeIn(400).attr('id',set_id_preview).stop().animate({height:get_height+'px'},200);
    $("body,html").stop().animate({'scrollTop':0});
    //Resize
     resize_column();
});


/*--------------
    CODE -- Style
----------------*/
//hljs.initHighlightingOnLoad() ;
hljs.initHighlighting();



/*--------------
    TEXTAREA -- CHANGE
----------------*/
function sync_preview(text){
    var get_id = $(text).closest(".form_box").attr('id');
    var sync_pre ='#'+get_id+'pre';
    var get_height = $(text).innerHeight()+2;
    $(sync_pre).stop().animate({height:get_height+'px'},200);
    var key_val = $(text).val();
//振り分け：：：： .from_box has class code_flag
    if ($(text).closest(".form_box").hasClass("code_flag")) {
                $(sync_pre).find('code').text(key_val);
    }else{
            if( key_val.match(/\n\@###/g) !=null ){
                    key_val = key_val.replace(/\n\@###/g,'\n-----------------------------------------------------------------');
                    $(sync_pre).addClass("pre_bold");
            }else{
                    $(sync_pre).removeClass("pre_bold");
            }
            $(sync_pre).text(key_val);
    }
}

var observe;
    observe = function (element, event, handler) {
        element.addEventListener(event, handler, false);
    };

$(document).on("focus",".input_area",function(){
    var text = $(this)[0];
        function resize () {
            text.style.height = 'auto';
            text.style.height = text.scrollHeight+'px';
            //Sync preview
            sync_preview(text);
            resize_column();
        }
        function delayedResize () {
            window.setTimeout(resize, 0);
        }
    observe(text,'change',resize);
    observe(text,'cut',delayedResize);
    observe(text,'paste',delayedResize);
    observe(text,'drop',delayedResize);
    observe(text,'keydown',delayedResize);
    text.focus();
    text.select();
    resize();
});

//////////////////////////
window.addEventListener("beforeunload", function(e){
   // Do something
    console.log("Bye now :)");
}, false);
/////////////////////////
});
</script>

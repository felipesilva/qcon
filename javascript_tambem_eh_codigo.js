/**
 *
 * @author Felipe Silva (ramal 6427)
 *
 * @requires glb.container.js
 * @requires glb.tooltip.js
 * @requires glb.showMessage.js
 * @requires glb.popin.js
 * @requires glb.metadata.js
 * @requires glb.validateKeywords.js
 * @requires glb.countCharacters.js
 * @requires jquery.template.js
 *
 */

(function($) {

    var Highlight = function(highlight, options){
        this.options = $.extend(options, {
            move: '/admin/estrutura/highlight/{uuidHighlight}/new_move/box/{uuidBox}',
            save: '/admin/estrutura/highlight/new_save/box/{uuidBox}',
            edit: '/admin/estrutura/highlight/new_edit/{uuidHighlight}/box/{uuidBox}',
            erase: '/admin/estrutura/highlight/delete/{uuidHighlight}/box/{uuidBox}',
            photoVisible: '/admin/estrutura/highlight/photo_visible/{uuidHighlight}',
            saveStyle: '/admin/estrutura/highlight/{uuidHighlight}/save-style/{styleName}'
        });
        this.$highlight = $(highlight);
        this.$box = this.$highlight.parents('.cma-box:first');
        this.setMetadata();
        this.setItemsMetadata();

        this.markHighlightIfRequired();
        this.markIfItemHighlightRequired(this); //verificando subitems e marcando se forem requeridos

        this.setValid();
        this.tooltip();
        this.setDroppable();
        this.setDraggable();
        this.outerItems();
        this.metadata = null;
    };

    $.extend(Highlight.prototype, {
        /**
         * Aplica o tooltip todos os highlights com a classe 'cma-highlight'
         * que nao estao sendo editados e nao estao inativos.
         */
        tooltip: function(){
            var Highlight = this;

            this.$highlight.toolTip({
                target: '.menu-cma-chamada-edit',
                trigger: 'mouseenter',
                eventOut: 'mouseleave',
                timeout: 0,
                timein: 0,
                posX: -40,
                posY: 1
                }, function(highlight, menu){
                    var $menu = $(menu);
                    var $highlight = $(highlight);
                    var $box = Highlight.$box;

                    $menu.find('.btn-fechar')
                        .unbind('click.tooltip')
                        .bind('click.tooltip', function(){
                            if ( $highlight.attr('id') !== '' ) {
                                Highlight.erase();
                            }
                            return false;
                        });

                    $highlight
                        .unbind('click.editHighlight')
                        .bind('click.editHighlight', function(event){
                            $.closeToolTip({target: $('.cma-highlight', $box), tooltip: $menu});
                            Highlight.edit();

                            return false;
                        });

                    //Delegate events that config de highlight
                    Highlight.bindConfig($menu);

                });

        },
        /**
         * Delega eventos as opcoes de configuracao do highlight
         */
        bindConfig: function($menu){
            var Highlight = this;
            var _data = this.obtemDataDaInstancia();
            var $btnConfig = $('.btn-config', $menu);
            
            if (_data.hasPhoto === 1 || this.$highlight.parents(".cma-area:first").attr("data") !== "[]") {
                
                $menu.css({'width': 40});
                
                $btnConfig
                    .show()
                    .unbind('click.config')
                    .bind('click.config', function(event){
                        try {
                            Highlight.configPhoto();
                            Highlight.setupStyleFilter();
                        } catch(e){
                            console.log(e);
                        }

                        return false;
                    });
            } else {
                $btnConfig.hide();
                $menu.css({'width': 20, 'left': $menu.offset().left + 20});
            }
        },
        /**
         * Tratamento de foto opcional no highlight
         */
        configPhoto: function(){

            var Highlight = this;
            var $photo = this.hasPhoto();
            var $tooltipConfig = $('.tooltip-highlight-config');
            var $inputHasPhoto = $('input.hasphoto', $tooltipConfig);
            var _data = this.obtemDataDaInstancia();
            var _tootipConfigX = this.$highlight.width() + this.$highlight.offset().left - 40;

            $tooltipConfig
                .show()
                .css({
                    'position': 'absolute',
                    'top': this.$highlight.offset().top,
                    'left': _tootipConfigX
                })
                .find('.fechar')
                    .unbind('change.config')
                    .bind('click.config', function() {
                        $(this).parents('.tooltip-highlight-config').hide();
                        return false;
                    });

            if (_data.hasPhoto === 0) {
                $inputHasPhoto.parents('.photoControl:first').hide();
                return;
            }

            $inputHasPhoto.parents('.photoControl:first').show();

            if (_data.isPhotoVisible ) {
                $inputHasPhoto.attr("checked", "checked");
            } else {
                $inputHasPhoto.removeAttr("checked");
            }

            $inputHasPhoto
                .unbind('change.config')
                .bind('change.config', function(){
                
                    var $photoComposition = $photo
                            .parents('.foto:first')
                            .andSelf();

                    if ($(this).is(":checked")) {
                        $photoComposition.removeClass("cma-photo-invisible");
                        _data.isPhotoVisible = 1;
                    } else {
                        $photoComposition.addClass("cma-photo-invisible");
                        _data.isPhotoVisible = 0;
                    }
                    
                    Highlight.atualizaDataDaInstancia(_data);

                    Highlight.setPhotoVisible(_data.isPhotoVisible);
                });

        },
        /*
            Obtém os estilos da área atual e cria uma lista deles no tooltip
        */
        setupStyleFilter: function () {

            var Highlight = this;
            var $scrollableContainer;
            
            $('.tooltip-highlight-config').data('__currentHighlight__', Highlight);
            var _data = this.obtemDataDaInstancia();
            if (_data.hasPhoto === 0) {
                $('#cma-highlight-style-set .list-filter').css({'border-bottom': 'none'});
            } else {
                $('#cma-highlight-style-set .list-filter').css({'border-bottom': '1px solid #CCC'});
            }
            
            var setInitialValues = function() {
                suggest = arguments[0] || $('.tooltip-highlight-config #glb-style-choose').data('__glbsuggest__');
                var _highlightData = _data;
                
                if (_highlightData.style && _highlightData.style.value) {
                    
                    var $style = $('#style-' + _highlightData.style.value);
                    if ($style.size() !== 0) {
                        $('#glb-style-dropdown-area').scrollTop($style.position().top);
                    }
                    
                    suggest.reset({
                        'itemValue': _highlightData.style.value,
                        'selectedItemIndex': $style.prevAll().size() || null
                    });
                    
                } else {
                    suggest.reset();
                }
            };
            

            if (window.suggestRunned === true) {
            
                $('#glb-style-choose').val('');

                var suggest = $('.tooltip-highlight-config #glb-style-choose').data('__glbsuggest__');
                suggest.refreshData();
                suggest.feedDropDown();
                suggest.bindItensEvents();
                
                setInitialValues(suggest);
                
            } else {

                window.suggestRunned = true;
                
                $('#glb-style-choose')
                    .suggest({
                        'dataSource': function(options) {
                            var $currentArea = $('.tooltip-highlight-config').data('__currentHighlight__').$highlight.parents(".cma-area:first");
                            var rawData = $currentArea.attr('data');

                            if (!rawData) {
                                $('#glb-style-choose-area').hide();
                                return [];
                            }

                            var currentAreaData = JSON.parse(rawData);

                            if (currentAreaData.length === 0) {
                                $("#cma-highlight-style-set").hide();
                            } else {
                                $("#cma-highlight-style-set")
                                    .show()
                                        .find('glb-style-choose')
                                            .focus();
                            }
                            
                            $.each(currentAreaData, function(index) {
                                if (currentAreaData[index]['default'] === true) {
                                    currentAreaData[index]['display'] += ' (Padrão)';
                                    return false;
                                }
                            });

                            return currentAreaData;
                        },
                        'searchPath': 'display',
                        'template': function(options) {
                            var $who = this.next('#suggest-template');
                            var html = $who.html();
                            $who.remove();
                            return html;
                        },
                        'selectedClass': 'selected-item',
                        'valuePath': 'value',
                        'showOnFocus': false,
                        'renderFunction': function(options, newItem, $newItem) {
                            if (this.val() !== '') {
                                var regex = new RegExp('(' + this.val() + ')','gi');
                                $newItem.html($newItem.text().replace(regex, '<strong>$1</strong>'));
                            }
                        },
                        'afterRenderItems': function(options, $container) {
                            $container.parent('#glb-style-dropdown-area').scrollTop(0);

                            var HL = $('.tooltip-highlight-config').data('__currentHighlight__');
                            var _highlightData = HL.$highlight.data('hlMetadata');
                            
                            if (_highlightData.style && _highlightData.style.value) {
                                $('#style-' + _highlightData.style.value).addClass('selected-item');
                            }
                        },
                        'move': function(options, oldIndex, newIndex, $selectedOption) {
                            var pos = $selectedOption.position();
                            $scrollableContainer.stop().scrollTo({'top': pos.top}, 500);
                        },
                        'change': function(options, oldValue, newValue) {
                            var HL = $('.tooltip-highlight-config').data('__currentHighlight__');

                            HL.$highlight
                                .attr('className', HL.$highlight.attr('className').replace(/glb-hl-style-[^\s]+/,''))
                                .addClass(newValue);

                            var highlightData = HL.$highlight.data('hlMetadata');
                            highlightData['style'] = {value: newValue};
                            HL.$highlight.data('hlMetadata', highlightData);
                            HL.$highlight.attr('data', JSON.stringify(highlightData));

                            if (HL.$highlight.attr('id') !== '') {
                                var url = HL.options.saveStyle.replace('{uuidHighlight}', HL.$highlight.attr('id'))
                                                              .replace('{styleName}', newValue);
                                $.ajax({
                                    url: url,
                                    type: 'POST',
                                    cache: false
                                });
                            }

                        },
                        'params': {
                            'highlight': Highlight
                        }
                    });
                
                setInitialValues();
                
                $scrollableContainer = $('#glb-style-dropdown-area');
            }

        },
        setPhotoVisible: function(isVisible){

            var _highlightId = this.$highlight.attr('id');
            var _self = this;
            if (! _highlightId ) { return false; }

            var _url = this.options.photoVisible.replace('{uuidHighlight}', _highlightId);

            $.ajax({
                url: _url,
                cache: false,
                type: 'POST',
                data: {"is_photo_visible":isVisible},

                success:function(){
                    var _data = _self.obtemDataDaInstancia();
                    _data['highlightValid'] = _self.validate()? 1: 0;
                    _self.atualizaDataDaInstancia(_data);
                    _self.setValid();
                }
            });
        },
        /**
         * Delega a todos elementos com a classe 'cma-highlight-item-outer'
         * a edicao da chamada a qual o item de chamada pertence.
         * @params {jQuery object} $box Contexto para aplicar eventos nos highlights
         */
        outerItems: function($box){
            var Highlight = this;

            $('.cma-highlight-item-outer', $box)
                .unbind('.highlight_outer')
                .bind('click.highlight_outer', function(){
                    var _highlightRel = $(this).metadata({type:'attr', name:'extras'}).highlight_rel;
                   
                    var $HighlightItem = $(this);
                    var data = {};

                    if (_highlightRel) {
                        var $highlight = Highlight.$box.find('.cma-highlight-order-' + _highlightRel);

                        if (!/.*?(cma-highlight-inative(\s|$)).*/.test($highlight.attr('class'))) {
                            if ( Highlight.hasPhoto($highlight) ) {
                                data.photo = Highlight.hasPhoto($highlight) ;
                            }

                            data.highlight = $highlight;

                            //edit highligh
                            Highlight.edit(data);
                        }
                };

                return false;
            });
        },
        /**
         * Verifica se um highlight tem foto
         * @returns A foto do hightlight, caso tenha.
         */
        hasPhoto: function(){
            var $box = this.$box;
            var $photo = $('.cma-highlight-photo', $box);
            var _highlightData = this.obtemDataDaInstancia();
            var $photoSelected = null;

            $.each($photo, function(){
                var _photoData = $(this).metadata({type: 'attr',  name: 'data'});

                if(_photoData.highlight === _highlightData.highlightOrder) {
                    $photoSelected = $(this);
                }
            });

            return $photoSelected;
        },
        /**
         * Vincula os dados do highlight objeto jQuery, usando o metodo $.data()
         */
        setMetadata: function(){
            var _metadata = this.$highlight.metadata({type: 'attr', name:'data'});
            this.atualizaDataDaInstancia(_metadata);

            var _keys = ['highlightRequired', 'linksToRequired', 'isPhotoVisible', 'highlightValid'];

            $.each(_keys, function(i, item){
                if (_metadata[item] === undefined) { throw new TypeError("The key "+ item +" does not exist.");  }
            });
        },
        setItemsMetadata: function(){
            var $items = this.$highlight.find('.cma-highlight-item');

            $items.each(function() {
                var _metadata = $(this).metadata({type: 'attr', name:'data'});
                $(this).data('hlItemMetadata', _metadata);
            });
        },
        setActions: function(){
            var Box = $.container.box;
            var $macroarea = this.$highlight.parents('.cma-macroarea:first');
            var $box = this.$box;
            var $actions = $('.box-highlight-actions.highlight-actions-template').clone();
            var _self = this;
            $actions.removeClass("highlight-actions-template");
            //Adiciona o box de actions no highlight
            this.$highlight.prepend($actions);
            
            //Posiciona o action baseado na posicao do highlight relativa a macroarea
            var _macroareaRight = $macroarea.offset().left + $macroarea.width();
            var _highlightRight = this.$highlight.offset().left + $actions.width();
            
            if (_highlightRight > _macroareaRight) {
                $actions
                    .css('margin-left', this.$highlight.width() - $actions.width())
                    .find('.container').css('background-position', '-336px -14px');
            }
            
            var $moreOptions = $actions.find('ul');
            $moreOptions.hide();

            //Evento para mostrar mais opcoes de link
            $actions.find('.mais-opcoes a').unbind().toggle(function(){
                $moreOptions.slideDown('fast');
                $(this).parent().addClass('mais-opcoes-active');
                return false;
            },function(){
                $moreOptions.slideUp('fast');
                $(this).parent().removeClass('mais-opcoes-active');
                return false;
            });

            //Cancelando edicao de um box
            this.$highlight.find('.cma-highlight-cancel')
                .unbind('click')
                .bind('click', function(){
                    $box.removeClass('cma-box-editing');
                    Box.get($box);
                    return false;
                });
        },
        /**
         * Metodo para posicionar o box de link ao seu respectivo highlight
         */
        setActionsPosition: function(){
            var $actions = this.$highlight.find('.box-highlight-actions');

            $actions.show().css({marginTop: this.$highlight.height()});
        },
        setLink: function(){
            var _link = $('a.cma-highlight-item', this.$highlight).attr('href');
            var $actions = $('.box-highlight-actions', this.$highlight);

            // seta os valores do checkbox baseado no link
            if( _link )
            {
                if( _link.match("^javascript:window.open") )
                {
                    $('#cma-highlight-link-new-page', $actions).attr("checked", "checked");
                    _link = _link.replace( "javascript:window.open('", "" );
                    _link = _link.replace( "');void(0);", "" );
                }
                else if( _link.match("^javascript:popupGaleria") )
                {
                    $('#cma-highlight-link-gallery', $actions).attr("checked", "checked");
                    _link = _link.replace( "javascript:popupGaleria('", "" );
                    _link = _link.replace( "');void(0);", "" );
                }
            }

            this.$highlight.find('#cma-highlight-link').val(_link);
        },
        editInPlace: function(){
            var Highlight = this;

            // Creating highlight items collection
            var $items = $('.cma-highlight-item', this.$highlight).not('.cma-highlight-photo').not('.cma-highlight-video');

            $items.editinplace({
                onKeyup: function(){
                    Highlight.setActionsPosition();
                },
                hasPhoto: Highlight.hasPhoto(),
                initialWidth: Highlight.$highlight.width()
            });
        },
        populate: function(data){
            var _data = data;

            var _header = (_data.header) ? _data.header : '';
            var _title = (_data.title) ? _data.title : '';
            var _subtitle = (_data.subtitle) ? _data.subtitle : '';
            var _url = (_data.url) ? _data.url : '';

            $('.cma-highlight-header', this.$highlight).val(_header);
            $('.cma-highlight-title', this.$highlight).val(_title);
            $('.cma-highlight-subtitle', this.$highlight).val(_subtitle);

            this.$highlight.find('#cma-highlight-link').val(_url);
        },
        clearDefaultValues: function(){
            var _values = ['editar chapéu', 'editar título', 'editar subtítulo', 'editar legenda'];
            var $items = this.$highlight.find('textarea.cma-highlight-item');

            $items.each(function(i, item){
                var $item = $(this);
                $.each(_values, function(j){
                    if ($item.val() === _values[j]) { $item.val(''); }
                });
            });
        },
        /**
         * Abre uma chamada para edicao
         */
        edit: function(data){
            var Box = $.container.box;
            var Highlight = this;

            var $photo = this.hasPhoto();
            var $box = this.$box;

            $box.addClass('cma-box-editing');

            //EditInPlace
            this.editInPlace();

            //Clear default values
            this.clearDefaultValues();

            //Set actions, like a tooltip to save or cancel the highlight editing
            this.setActions();

            //Set link
            this.setLink();

            //Highlight behaviors
            this.$highlight
                .unbind('click.editHighlight')
                .removeClass('box-on') //its necessary refactoring on tooltip plugin.
                .addClass('cma-highlight-editing')
                .droppable('disable')
                .find('textarea, input')
                .bind('mouseup keyup', function(){
                    Highlight.checkSaveButton();
                });


            //Cancel tooltip editing
            $.closeToolTip({target: $('.cma-highlight', $box), tooltip: $('.menu-cma-chamada-edit')});

            $('.cma-highlight', $box).not(this.$highlight).addClass('cma-highlight-inative');

            $('.cma-highlight', $box).droppable("destroy");

            //Unbind outers
            $('.cma-highlight-item-outer', $box).unbind();

            //Bind photo
            if ($photo) {$.container.highlight.photo.init( $photo, Highlight );}

            //Positioning actions
            this.setActionsPosition();

            //Coloring backgrond of link
            this.setBackgroundWhenLinkRequired();

            //Change button save status
            if (data) { this.populate(data); }

            // Desativando os links dos highlights inativos
            $('a', $('.cma-highlight-inative', $box)).bind('click', function(){return false;});

            this.checkSaveButton();
        },
        setBackgroundWhenLinkRequired: function() {
            var highlightData = this.obtemDadosDoHighlight();
            var $cmaHighlightLink = this.$highlight.find('.box-highlight-actions #cma-highlight-link').removeClass("cma-highlight-item-required");
            if (highlightData && highlightData.linksToRequired === 1) {
                $cmaHighlightLink.addClass("cma-highlight-item-required");
            }
        },
        obtemDadosDoHighlight: function(){
            var $box = this.$box;
            var $actions = this.$highlight.find('.box-highlight-actions');
            var $photo = this.hasPhoto();

            var $title = ( $('textarea.cma-highlight-title', this.$highlight).length !== 0 ) ? $('textarea.cma-highlight-title', this.$highlight) : $('.cma-highlight-title', this.$highlight);
            var $subtitle =  ( $('textarea.cma-highlight-subtitle', this.$highlight).length !== 0 ) ? $('textarea.cma-highlight-subtitle', this.$highlight) : $('.cma-highlight-subtitle', this.$highlight);
            var $header =  ( $('textarea.cma-highlight-header', this.$highlight).length !== 0 ) ? $('textarea.cma-highlight-header', this.$highlight) : $('.cma-highlight-header', this.$highlight);
            var $photoSubtitle = ( $('textarea.cma-highlight-photosubtitle', this.$highlight).length !== 0 ) ? $('textarea.cma-highlight-photosubtitle', this.$highlight) : $('.cma-highlight-photosubtitle', this.$highlight);

            var _photoData = ($photo) ? $photo.data('hlItemMetadata') : null;
            var _highlightData = this.obtemDataDaInstancia();
            //TODO rever regra de coo pegar os valores. Ta ruim
            var title = ($title && $title.length !== 0 && $title[0].tagName === 'TEXTAREA') ? $title.val() : $title.html();
            var subtitle = ($subtitle && $subtitle.length !== 0 && $subtitle[0].tagName === 'TEXTAREA') ? $subtitle.val() : $subtitle.html();
            var header = ($header && $header.length !== 0 && $header[0].tagName === 'TEXTAREA') ? $header.val() : $header.html();
            var photoSubtitle = ($photoSubtitle && $photoSubtitle.length !== 0 && $photoSubtitle[0].tagName === 'TEXTAREA') ? $photoSubtitle.val() : $photoSubtitle.html();
            var photoId = (_photoData) ? _photoData.identifier : '';
            var highlightId = this.$highlight.attr('id');
            var styleValue = _highlightData.style ? _highlightData.style.value : null;
            var linkTarget = $('input[type=radio]:checked', $actions).val();
            var linksTo = $('#cma-highlight-link', $actions).val();
            var photoURL = $photo && photoId? $photo.attr('src'): null;
            var photoCredits = $photo && photoId? $photo.attr('alt'): null;


            switch(linkTarget){
                case "new-page":
                    linksTo = "javascript:window.open('" + linksTo + "');void(0);"
                    break;
                case "gallery":
                    linksTo = "javascript:popupGaleria('" + linksTo + "');void(0);"
                    break;
            }

            var _data = {}
            _data.box_id = $box.attr('id');
            _data.highlightorder = _highlightData.highlightOrder;
            _data.is_highlight = 'true';
            // manda para o server ja como 0 ou 1
            _data.isPhotoVisible = ( eval(_highlightData.isPhotoVisible) ) ? 1 : 0;
            _data.highlightTemplateId = _highlightData.highlightTemplateId;

            if (title) { _data.title = title; }
            if (subtitle) { _data.subtitle = subtitle; }
            if (header) { _data.header = header; }
            if (linksTo) { _data.links_to = linksTo; }
            if (photoId) { _data.photo_id = photoId; }
            if (photoSubtitle) { _data.photo_subtitle = photoSubtitle; }
            if (highlightId !== '') { _data.highlight_id = highlightId; }
            if (styleValue) { _data.style = styleValue; }
            if (photoURL) { _data.photoURL = photoURL; }
            if (photoCredits) { _data.photoCredits = photoCredits; }

            return _data;
        },
        /**
         * Metodo para criar uma chamada
         */
        create: function(){

            var _highlightId = this.$highlight.attr('id');

            var $box = this.$box;

            var urlSave = this.options.save.replace('{uuidBox}', $box.attr('id'));
            var urlEdit = this.options.edit.replace('{uuidBox}', $box.attr('id')).replace('{uuidHighlight}', _highlightId);
            var _url = _highlightId !== '' ? urlEdit : urlSave;

            // loading
            var Container = $.container;

            Container.loading($box);
            var Box = $.container.box;

            var _self = this;

            $.ajax({
                url: _url,
                cache: false,
                type: 'POST',
                data: _self.obtemDadosDoHighlight(),
                success: function(html_do_box){
                    Box.atualiza($box, html_do_box);
                },
                error: function(r){
                    Container.loading($box, 'destroy');
                    $('#cma-doc').showMessage({response: r});

                }
            });
        },
        /**
         *  Metodo que marca um highlight como invalido
         */
        setValid:function(){
            var isValid = this.obtemDataDaInstancia()['highlightValid'];
            if (isValid) {
                this.$highlight.removeClass("cma-highlight-invalid");
            } else {
                this.$highlight.addClass("cma-highlight-invalid");
            }
        },
        /**
         * Metodo para deletar uma chamada
         */
        erase: function(){
            var Container = $.container;
            var Box = $.container.box;
            var $box = this.$box;
            var _url = this.options.erase.replace('{uuidHighlight}', this.$highlight.attr('id'))
                                         .replace('{uuidBox}', $box.attr('id'));

            Container.loading($box);

            $.ajax({
                type: 'POST',
                url: _url,
                success: function(r){
                    Box.atualiza($box, r);
                },
                error: function(r){
                    Container.loading($box, 'destroy');
                    $('#cma-doc').showMessage({response: r});
                }
            });
        },
        /**
         * Metodo que valida a macroarea e as areas.
         * @params {jQuery Object} $box Box que a chamada se encontra.
         */
        validateAreas: function($box){
            var Area = $.container.area;
            var $area = $box.parents('.cma-area:first');

            //Validando areas
            Area.validate($area);
        },
        /**
         * Metodo que valida se o highlight pode ser salvo
         * @params {jQuery Object} $highlight Chamada e ser validada.
         * @returns Retorna um booleano, indicando se a chamada foi validada ou não.
        */
        validate: function(){
            var $box = this.$box;
            var _data = this.obtemDataDaInstancia();
            var _validated = true;
            var _linkRule = /^(javascript:window\.open\(\'|javascript:popupGaleria\(\'){0,1}(ftp|http|https):\/\/[A-Za-z0-9\.-]{2,}\.[A-Za-z]{2,6}/;
            var $link = this.$highlight.find('#cma-highlight-link');
            var $items = this.$highlight.find('.cma-highlight-item');
            var $photo = this.hasPhoto();

            if(_data.linksToRequired){
                if ( $link.val() === '' ) {
                    _validated = false;
                }
            }

            if ( $link.val() ) {
                if ( !_linkRule.test($link.val()) ) {
                    _validated = false;
                }
            }

            if($photo) {
                var photoRequired = _data.hasPhoto && _data.isPhotoVisible;

                if(eval(photoRequired) == true){
                    if ($photo.attr('id') == '' || $photo.attr('id') == 'null') {
                        _validated = false;
                    }
                }
            }

            $.each($items, function(){
                var _itemData = $(this).data('hlItemMetadata');

                if(_itemData) {
                    if ((_itemData.required == "true") && ($(this).val() == '')) {
                        _validated = false;
                    }
                    if ($(this).val().length > _itemData.maxlength) {
                        _validated = false;
                    }
                }
            });
            return _validated;
        },
        /**
         * Metodo que muda o estado do botao permintindo ou nao que a chamada seja salva.
         */
        checkSaveButton: function() {
            var Highlight = this;
            var $box = this.$box;
            var $actions = $('.box-highlight-actions', $box);
            var $btnSave = $('.cma-highlight-save', $actions);
            var $btnCancel = $('.cma-highlight-cancel', $actions);
            var $inputHighlight = this.$highlight.parents('.cma-box-content');

            $inputHighlight.unbind('.esc').bind('keydown.esc', function(e) {
                if (e.which === 27) { // Esc key
                    $btnCancel.trigger('click');
                    return false;
                }
            });

            if (!Highlight.isHighlightEmpty() && Highlight.isValidFill()) {
                $btnSave.removeClass('btn-inative')
                    .unbind('.highlight_save')
                    .bind('click.highlight_save', function() {
                        Highlight.validate();
                        Highlight.create();
                        $box.removeClass('cma-box-editing');

                        return false;
                    });

                $inputHighlight.unbind('.enter').bind('keydown.enter', function(e) {
                    if (e.ctrlKey && e.which == 13) { // Ctrl+Enter key
                        $btnSave.trigger('click');
                        return false;
                    }
                });

            } else {
                $btnSave.addClass('btn-inative').unbind('.highlight_save').bind('click.highlight_save', function() {
                    return false;
                });
            }

        },
        /**
         * Metodo que verifica se os campos de um highlight foram preeenchidos.
         * @returns booleanedi
         */
        isHighlightEmpty: function(){
            var $items = this.$highlight.find('.cma-highlight-item');
            var _empty = true;
            if ($items.length !== 0) {
                $.each($items, function() {
                    if ($.trim($(this).val()) !== ''){
                        _empty = false;
                        return false;
                    }
                });
           }

           return _empty;
        },
        isValidFill: function(){
            var $items = this.$highlight.find('.cma-highlight-item');
            var _valid = true;
            if ($items.length !== 0) {
                $.each($items, function() {
                    if ($(this).val().length > 0 && $.trim($(this).val()) === ''){
                        _valid = false;
                        return false;
                    }
                });
           }

           return _valid;
        },
        /**
        * Metodo que, dada uma url de imagem de video, retorna a mesma com foto do tamanho EX
        */
        formataURLFotoDeVideo: function(urlOriginal){
            var regex = RegExp("^(.*),00(.*\.jpg)$");
            return urlOriginal.replace(regex, "$1-EX,00$2");
        },
        /**
         * Metodo que torna as chamadas droppables, permitindo que elas recebam atributos,
         * como: titulo, subtitulo e etc.
         */
        setDroppable: function(){
            var Box = $.container.box;
            var Area = $.container.area;
            var Highlight = this;
            var Container = $.container;

            this.$highlight.droppable("destroy").droppable({
                accept: function(ui){
                    return (ui.hasClass("cma-highlight") || ui.hasClass("cma-highlight-drag"));
                },
                hoverClass: 'cma-highlight-drop-hover',
                drop: function(ev, ui) {
                    if (ui.draggable.hasClass("cma-highlight-drag")){
                        var _title = $('a', ui.draggable).text();
                        var _url = $('a', ui.draggable).attr('href');
                        var _image_src = $('img', ui.draggable).attr('src');
                        var $foto = Highlight.hasPhoto();
                        if($foto && _image_src){
                            $foto.attr('src', Highlight.formataURLFotoDeVideo(_image_src));
                            $foto.attr('title', _title);
                            $foto.attr('alt', '');
                            var _photoData = $foto.data('hlItemMetadata');
                            _photoData.identifier = MatchIdVideo(_url);
                            $foto.data('hlItemMetadata', _photoData);
                        }

                        Highlight.edit({ title: _title, url: _url, photo: $foto });

                    } else if (ui.draggable.hasClass("cma-highlight")){
                        var _dataTarget = $(this).metadata({type:'attr', name:'data'});
                        var _dataOrigin = Highlight.obtemDataDaInstancia();

                        var $boxTarget = $(this).parents(".cma-box");
                        var $boxOrigin = ui.draggable.parents(".cma-box");
                        var precisa_atualizar_destino = $boxOrigin.attr("id") !== $boxTarget.attr("id") ;
                        var _url = Highlight.options.move.replace('{uuidHighlight}',ui.draggable.attr('id'))
                                                         .replace('{uuidBox}', $boxTarget.attr('id'));

                        Container.loading($boxOrigin);
                        $.ajax({
                            type: 'POST',
                            data: {highlightorder: _dataOrigin.highlightOrder, highlightTemplateId: _dataTarget.highlightTemplateId},
                            url: _url,
                            success: function(r){
                                Box.atualiza($boxOrigin, r);
                                
                                if( $boxOrigin.attr("id") !== $boxTarget.attr("id") ) {
                                    Box.get($boxTarget);
                                }    
                            },
                            error: function(r){
                                Container.loading($boxOrigin, 'destroy');

                                $('#cma-doc').showMessage({response: r, timeout: 4000});
                                _obj = JSON.parse(r.responseText);


                                if (_obj.errors.error.code === 2108) {
                                    Area.get($boxOrigin.parents('.cma-area:first'));
                                } else if(_obj.errors.error.code === 2109) {
                                    Area.get($boxTarget.parents('.cma-area:first'));
                                }
                            }
                        });

                    }
                }
            });

        },
        /**
         * Método que habilita os highlights com conteudo, possibilitando mover os highlights de posicao
         * @params {jQuery Object} $h Coleção de highlight que se tornarão draggable.
         *
         */
        setDraggable: function(){
            var Highlight = this;
            var _x = 0;
            var _y = 0;

            if(! $("#cma-drag-highlight").get(0) ){
                $("body").append( $("<div id='cma-drag-highlight'></div>") );
            }
            var $cmaDragHighlight = $("#cma-drag-highlight");
                $cmaDragHighlight
                    .width( 0 )
                    .height( 0 )
                    .css({'position':'absolute','overflow':'hidden','top':0,'left':0});

            this.$highlight.filter("[id!='']")
                .draggable("destroy")
                .draggable({
                    helper:'clone',
                    appendTo:'#cma-drag-highlight',
                    scroll: true,
                    scrollSensitivity: 50,
                    scrollSpeed: 40,
                    cursorAt: { left: Highlight.$highlight.width()/2, top: Highlight.$highlight.height()/2 },
                    start:function(event, ui){
                        $cmaDragHighlight.attr('className', $(this).parents('.chamada:first').attr("className") );
                        $cmaDragHighlight.width( $(document).width() );
                        $cmaDragHighlight.height( $(document).height() );

                        ui.helper.css('background-color','#FFF');
                        ui.helper.css('opacity','0.8');
                        ui.helper.width( $(this).width() );
                        ui.helper.height( $(this).height() );
                    },
                    stop:function(event, ui){
                        $cmaDragHighlight.attr('className', '' );
                        $cmaDragHighlight.width( 0 );
                        $cmaDragHighlight.height( 0 );
                        $cmaDragHighlight.empty();
                    }
                });
        },
        markHighlightIfRequired: function() {
            var highlightData = this.obtemDataDaInstancia();
            if (highlightData && highlightData.highlightRequired === 1) {
                this.$highlight.addClass('cma-highlight-required');
            }
        },
        markIfItemHighlightRequired: function(){
            this.$highlight.find('.cma-highlight-item').each(function(){
                var _itemData = $(this).data('hlItemMetadata');
                if(_itemData && _itemData.required === 1) {
                    $(this).addClass('cma-highlight-required');
                }
            });
        },
        obtemDataDaInstancia:function(){
            if (!this.metadata){
                this.metadata = this.$highlight.data('hlMetadata');
            }
            return this.metadata;
        },
        atualizaDataDaInstancia:function(data){
             this.$highlight.data('hlMetadata', data);
        }
        
    });

    /**
    * Inicializa o plugin Highlight
    */
    $.fn.highlight = function(options){
        this.each(function(){
            var _instance = new Highlight(this, options);
            $(this).data('__instance__', _instance);
        });
    };

})(jQuery);

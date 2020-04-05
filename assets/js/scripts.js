document.addEventListener('DOMContentLoaded', function () {
    var navController = {
        init: function () {
            var $navWrap = document.querySelector('.nav__wrap'),
                $navItems = document.querySelectorAll('.nav__wrap a.item');

            
            $navItems.forEach(element => {

                element.addEventListener('click', function ( e ) {
                    $navItems.forEach(element => element.classList.remove('active'));

                    this.classList.add('active');
                });
            });
        }
    };
    navController.init();
});
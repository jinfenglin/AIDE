

        <?php

        // Counting number of checked checkboxes.
        // $checked_count = count($_POST['check_list']);
        // echo "You have selected following ".$checked_count." option(s): <br/>";

        foreach($_POST['check_list'] as $attr) {

            echo "<div class='row' id='{$attr}-row'>\n";
          ?>

            <div class="col-md-12">

              <div class="panel panel-default">

                <div class="panel-heading">
                  <?php
                    echo "<h4 class='panel-title text-capitalize'>{$attr}</h4>\n";
                  ?>
                </div>

                <div class="panel-body">

                  <div class="col-md-12 small-southeast-align">


                    <div class="col-md-4">

                      <form class="form-horizontal">

                        <div class="form-group">
                          <label for="" class="col-md-5 control-label">Bucket Number:</label>
                          <div class="col-md-4">
                            <?php
                            echo "<select name='' class='form-control' id='{$attr}-bucketnum'>";
                            ?>
                            <option>5</option>
                            <option selected="selected">10</option>
                            <option>15</option>
                            <option>20</option>
                            <option>25</option>
                            <option>30</option>
                          </select>
                          </div>
                        </div>

                        <div class="form-group">
                          <label for="" class="col-md-5 control-label">Y Scale:</label>
                          <div class="col-md-4">
                            <?php
                            echo "<select name='' class='form-control' id='{$attr}-yscale'>";
                            ?>
                            <option selected="selected">linear</option>
                            <option>log10</option>
                          </select>
                        </div>
                      </div>


                        <div class="form-group">
                          <label for="" class="col-md-5 control-label">Show Histogram:</label>
                          <div class="col-md-7">
                            <div class="btn-group-vertical" role="group" aria-label="...">
                              <?php
                              echo "<button type='button' id='{$attr}-width-btn' class='btn btn-default'>Equi-width</button>\n";
                              echo "<button type='button' id='{$attr}-depth-btn' class='btn btn-default'>Equi-depth</button>\n";
                              ?>
                            </div>
                          </div>
                        </div>
                      </form>

                    </div>


                <div class='col-md-7'>

                  <form class="form-inline">
                    <div class="form-group">
                      <label class="sr-only" for="minvalue">Min Value</label>
                      <label class="sr-only" for="maxvalue">Max Value</label>
                      <div class="input-group">
                        <div class="input-group-addon">Min</div>
                        <?php
                        echo "<input type='text' class='form-control' id='{$attr}-minvalue' placeholder=''>\n";
                        ?>
                        <div class="input-group-addon">Max</div>
                        <?php
                        echo "<input type='text' class='form-control' id='{$attr}-maxvalue' placeholder=''>\n";
                        ?>
                      </div>
                    </div>
                    <?php
                    echo "<button type='button' class='btn btn-default' id='{$attr}-update-btn'>Update</button>\n";
                    ?>
                    <p class="help-block col-md-12">Please specify your interested value range here.</p>
                  </form>

                </div>

                <div class='col-md-1'>
                  <?php
                  echo "<button type='button' class='btn btn-default' id='{$attr}-delete-btn'>\n";
                  ?>
                  <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button>
              </div>

            </div>


            <div class="col-md-12">

              <div class='col-md-6 text-center small-bottom-margin medium-top-margin'>
                <?php
                echo "<h5 id='{$attr}-width-title'>Equi-width Histogram</h5>\n";
                ?>

              </div>
              <div class='col-md-6 text-center small-bottom-margin medium-top-margin'>
                <?php
                echo "<h5 id='{$attr}-depth-title'>Equi-depth Histogram</h5>\n";
                ?>

              </div>
            </div>

            <div class="col-md-12">
              <?php
              echo "\t<div id='width-chart-{$attr}' class='col-md-6'>\n";
                echo "\t</div>\n";
                echo "\t<div id='depth-chart-{$attr}' class='col-md-6'>\n";
                  echo "\t</div>\n";
                  ?>
                </div>


                </div>

              </div>

            </div>
          </div>

          <?php
            echo "<div class='row' id='hr-row-{$attr}'>\n";

            ?>
            <div class="col-md-12">
              <hr>
            </div>
          </div>


          <script type="text/javascript">

          <?php
          //width button hover events
          //echo "width_btn_hover($('#{$attr}-width-btn'));\n";
          //depth button hover events
          //echo "depth_btn_hover($('#{$attr}-depth-btn'));\n";

          //update button click event
          echo "update_btn_click($('#{$attr}-update-btn'), '{$attr}', '#{$attr}-minvalue', '#{$attr}-maxvalue');\n";

          //plot width histogram
          echo "width_chart('#width-chart-{$attr}', '{$attr}', '#{$attr}-bucketnum', $('#{$attr}-width-btn'), '#{$attr}-minvalue', '#{$attr}-maxvalue', '#{$attr}-yscale');\n";
          //plot depth histogram
          echo "depth_chart('#depth-chart-{$attr}', '{$attr}', '#{$attr}-bucketnum', $('#{$attr}-depth-btn'), '#{$attr}-minvalue', '#{$attr}-maxvalue', '#{$attr}-yscale');\n";

          //delete button click event
          echo "$('#{$attr}-delete-btn').on('click', function(event){\n";
            echo "$('#{$attr}-row').remove();\n";
            echo "$('#hr-row-{$attr}').remove();\n";
            echo "delete_attr('{$attr}');\n";
            echo "$(store_attr);\n";
            ?>

          });

          </script>


          <?php

        }   //for each loop

        ?>

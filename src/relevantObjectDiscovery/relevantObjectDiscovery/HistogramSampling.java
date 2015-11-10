package relevantObjectDiscovery;

import configuration.DBConnection;
import configuration.Global;
import mainPackage.Tuple;

import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

/**
 * Created by zhan on 7/1/15.
 */
public class HistogramSampling {

    public ArrayList<Tuple> sampling() throws IOException, SQLException {
        Connection connection = DBConnection.getConnection();
        Statement statement;
        ResultSet rs;
        ArrayList<Tuple> randomSamples = new ArrayList<Tuple>();
        String att_1 = Global.attributes.get(0).getName();
        String att_2 = Global.attributes.get(1).getName();
        Object att1_min = Global.attributes.get(0).getDomain().get(0);
        Object att1_max = Global.attributes.get(0).getDomain().get(Global.attributes.get(0).getDomain().size()-1);

        Object att2_min = Global.attributes.get(1).getDomain().get(0);
        Object att2_max = Global.attributes.get(1).getDomain().get(Global.attributes.get(1).getDomain().size()-1);

        String equi_width = "SELECT "+Global.OBJECT_KEY+","+ att_1 + "," + att_2 + " FROM (SELECT " + att_1 + "," + att_2 +
                ", row_number() over(partition by grp_1, grp_2 order by random()) as rn " +
                " from (select " + att_1 + "," + att_2 + ", width_bucket(" + att_1 + "," +
                att1_min + "," + att1_max +
                ", 4) as grp_1, width_bucket(" + att_2 + "," +
                att2_min + "," + att2_max +
                ", 5) as grp_2 from " + Global.TABLE_NAME + " where " + att_1 + " >= " + att1_min +
                " and " + att_1 + " < " + att1_max +
                " and " + att_2 + " >= " + att2_min + " and " + att_2 + " < " + att2_max +
                ") as sub1 ) as sub2 where rn <= 1;";

        String equi_depth = "select "+Global.OBJECT_KEY+","+ att_1 + "," + att_2 + " from (select " + att_1 + "," + att_2 +
                ", grp_1,grp_2, row_number() over (partition by grp_1, grp_2 order by random()) as rn " +
                " from (select " + att_1 + "," + att_2 + ",grp_1,ntile(5) over (partition by grp_1 " +
                " order by colc) as grp_2 from (select rowc, colc, ntile(4) over(order by rowc) as grp_1" +
                " from testing where "+ att_1 + " >= " + att1_min +
                " and " + att_1 + " < " + att1_max +
                " and " + att_2 + " >= " + att2_min + " and " + att_2 + " < " + att2_max + ") as sub1 )" +
                " as sub2) as sub3 where rn <= 1";

        //System.out.println(equi_depth);
        statement = connection.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);//make the cursor scrollable
        rs = statement.executeQuery(equi_depth);
        while(rs.next()){
        	Object key = rs.getString(1);
            Object[] attrValues = new Object[Global.attributes.size()];
            for(int m=1; m<=Global.attributes.size(); m++){
                attrValues[m-1] = rs.getString(m+1);
            }
            Tuple tuple = new Tuple(key, attrValues);
            randomSamples.add(tuple);
        }
        return randomSamples;
    }

    public static void main(String[] args) {
        new DBConnection();
        Connection connection = DBConnection.getConnection();
        Statement statement;
        ResultSet rs;
    }
}

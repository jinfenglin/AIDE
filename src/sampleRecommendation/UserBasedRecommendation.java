
package sampleRecommendation;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.apache.mahout.cf.taste.common.TasteException;
import org.apache.mahout.cf.taste.impl.model.file.FileDataModel;
import org.apache.mahout.cf.taste.impl.neighborhood.NearestNUserNeighborhood;
import org.apache.mahout.cf.taste.impl.recommender.GenericUserBasedRecommender;
import org.apache.mahout.cf.taste.impl.similarity.LogLikelihoodSimilarity;
import org.apache.mahout.cf.taste.model.DataModel;
import org.apache.mahout.cf.taste.neighborhood.UserNeighborhood;
import org.apache.mahout.cf.taste.recommender.RecommendedItem;
import org.apache.mahout.cf.taste.recommender.Recommender;
import org.apache.mahout.cf.taste.similarity.UserSimilarity;

public class UserBasedRecommendation {

	public static void main(String[] args) {
		DataModel model;
		try {
			model = new FileDataModel(new File("test.txt"));
			UserSimilarity userSimilarity = new LogLikelihoodSimilarity(model);
			UserNeighborhood neighborhood =
				      new NearestNUserNeighborhood(2, userSimilarity, model);
			Recommender recommender =
					  new GenericUserBasedRecommender(model, neighborhood, userSimilarity);
			List<RecommendedItem> recommendations =
					 recommender.recommend(2, 3);
					 for (RecommendedItem recommendation : recommendations) {
					 System.out.println(recommendation);
					 }
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (TasteException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
}
